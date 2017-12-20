import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from "../map.service";
import {ChartService} from "../chart.service";
import {SimpleTimer} from "ng2-simple-timer";
import {DataService} from "../csv-reader.service";
import {absFloor} from "ngx-bootstrap/bs-moment/utils";

@Component({
  selector: 'app-cumulative',
  templateUrl: './cumulative.component.html',
  styleUrls: ['./cumulative.component.scss']
})
export class CumulativeComponent implements OnInit {
  @ViewChild('contentDiv')
  contentDiv: ElementRef;
  @ViewChild('detailDiv')
  detailDiv: ElementRef;

  maxYValue = 100;
  averageData;

  selectors = ['COMMENT_LENGTH', 'COMMENT_LENGTH_PER_VIOLATION', 'TOTAL # VIOLATIONS', 'TOTAL # CRITICAL VIOLATIONS'];
  identifier = 'COMMENT_LENGTH';
  selectedCounty = null;

  ready = false;
  countyData = null;
  countyDataPerWeek = null;
  mapData: Object;
  chart: any;
  detailChart: any;

  chartOptions: any = {
    chart: {
      height: '400px',
      width: '500px',
      backgroundColor: '#f8f9fa',
    },
    title: {
      text: ''
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    colorAxis: {
      min: 0,
      max: 100,
    },
    plotOptions: null,
    series: null,
  };

  detailChartOptions: any = {
    chart: {
      type: 'spline',
      height: '600',
      width: '900',
      zoomType: 'xy',
      backgroundColor: '#f8f9fa',
    },
    title: {
      text: ''
    },
    plotOptions: {
      series: {
        connectNulls: true
      },
      line: {
        marker: {
          enabled: true
        },
      },
      spline: {
        marker: {
          enabled: false
        }
      },
    },
    xAxis: {
      type: 'category',
      categories: null,
    },
    yAxis: {
      max: 1000,
    },
    series: null,
  };

  private static extractMapDate(number) {
    let week = (number % 51 + 1).toString();
    if (week.length === 1) {
      week = `0${week}`;
    }
    const year = 2016 + absFloor(number / 52);
    return `${year}/${week}`;
  }

  constructor(private chartService: ChartService,
              private mapService: MapService,
              private dataService: DataService) {
  }

  ngOnInit() {
    this.mapService.getNYMap().subscribe(mapData => {
      this.mapData = mapData;
      this.dataService.getDataPerCounty(false).subscribe(countyData => {
        this.countyData = countyData;
        const data = this.extractData(countyData, this.identifier);

        this.chartOptions.chart.width = this.contentDiv.nativeElement.offsetWidth - 100;
        this.chartOptions.chart.height = '800px';
        this.maxYValue = this.extractMaxLenght();
        this.chartOptions.colorAxis.max = this.maxYValue;
        this.chartOptions.series = [{
          data: data,
          mapData: mapData,
          joinBy: 'hc-key',
        }];
        this.ready = true;
      });
      this.dataService.getDataPerCounty().subscribe(countyDataPerWeek => {
        this.countyDataPerWeek = countyDataPerWeek;
        if (this.averageData == null) {
          this.averageData = this.getAverage(this.countyDataPerWeek);
        }
      });
    });
  }

  saveChartInstance(chartInstance) {
    this.chart = chartInstance;
  }

  onChartRender(chartInstance) {
    if (this.averageData == null && this.countyDataPerWeek != null) {
      this.averageData = this.getAverage(this.countyDataPerWeek);
    }
  }

  saveDetailChartInstance(chartInstance) {
    this.detailChart = chartInstance;
  }

  onPointSelect(county) {
    county = county.context.properties.name.toLowerCase();
    this.selectedCounty = county;
    this.updateDetailChart(county);
  }

  onSelectChange(value) {
    this.identifier = value;
    const data = this.extractData(this.countyData, value);
    this.maxYValue = this.extractMaxLenght(value);

    this.averageData = this.getAverage();

    this.chart.update({
      colorAxis: {
        min: 0,
        max: this.maxYValue,
      }
    });

    if (this.selectedCounty != null) {
      this.updateDetailChart();
    }
    this.updateChart(data);
  }

  private updateChart(data, mapData = this.mapData, chart = this.chart) {
    chart.series[0].update({
      data: data,
      mapData: mapData,
      joinBy: 'hc-key',
    });
  }

  private updateDetailChart(county) {
    const countyData = this.extractCountyData(county, this.countyDataPerWeek);
    const dates = Array.from(new Set(countyData.map(it => it['YEAR_WEEK'])));
    const data = countyData.map(it => it[this.identifier]);

    this.detailChartOptions.series = [{
      data: data,
      name: county,
    }, {
      data: this.averageData,
      name: 'average',
    }];
    this.detailChartOptions.xAxis.categories = dates;
    this.detailChartOptions.yAxis.max = this.extractMaxLenght(this.identifier, this.countyDataPerWeek);

    this.detailChartOptions.chart.width = this.detailDiv.nativeElement.offsetWidth;
    this.detailChartOptions.chart.height = '570px';

    if (this.detailChart != null) {
      this.detailChart.update(this.detailChartOptions);

    }
  }
  private extractTimeData(yearWeek, identifier = this.identifier, data = this.countyData) {
    return this.extractData(data.filter(entry => entry.YEAR_WEEK === yearWeek), identifier);
  }


  private extractData(data, identifier) {
    return data.map(entry => {
      return {
        'hc-key': entry.GEOJSONID.toLowerCase(),
        'value': entry[identifier]
      };
    });
  }

  private getAverage(data = this.countyDataPerWeek) {
    const categories = Array.from(new Set(data.map(it => it.YEAR_WEEK)));
    const averages = [];

    categories.forEach(categorie => {
      const timeData = data
        .filter(it => it.YEAR_WEEK === categorie)
        .map(it => it[this.identifier]);
      const sum = timeData.reduce((a, b) => a + b);
      const avg = sum / timeData.length;
      averages.push(avg);
    });

    return averages;
  }

  private extractMaxLenght(identifier = this.identifier, data = this.countyData) {
    data = data
      .map(it => it[identifier]);
    return Math.max.apply(Math, data);
  }

  private extractCountyData(county, data = this.countyData) {
    return data
      .filter(it => it.COUNTY === county);
  }
}
