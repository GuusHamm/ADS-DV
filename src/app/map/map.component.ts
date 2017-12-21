import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {MapService} from '../map.service';
import {DataService} from '../csv-reader.service';
import {absFloor} from 'ngx-bootstrap/bs-moment/utils';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {SimpleTimer} from 'ng2-simple-timer';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {
  @ViewChild('contentDiv')
  contentDiv: ElementRef;
  @ViewChild('detailDiv')
  detailDiv: ElementRef;

  someRange = 53;
  maxTimeValue = 94;
  maxYValue = 100;
  averageData;

  autoPlay = false;

  selectors = [
    ['COMMENT_LENGTH', 'Commment length'],
    ['COMMENT_LENGTH_PER_VIOLATION', 'Comment length per violation'],
    ['TOTAL # VIOLATIONS', 'Total number of violations'],
    ['TOTAL # CRITICAL VIOLATIONS', 'Total number of critical']
  ];
  identifier = 'COMMENT_LENGTH';
  selectedCounty = null;

  ready = false;
  countyData = null;
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
      backgroundColor: '#f8f9fa'
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


  constructor(private mapService: MapService,
              private dataService: DataService,
              private simpleTimer: SimpleTimer) {
  }

  ngOnInit() {
    this.mapService.getNYMap().subscribe(mapData => {
      this.mapData = mapData;
      this.dataService.getDataPerCounty().subscribe(countyData => {
        this.countyData = countyData;

        this.chartOptions.chart.width = this.contentDiv.nativeElement.offsetWidth - 100;
        this.chartOptions.chart.height = '790px';
        this.maxYValue = this.extractMaxLenght();
        this.chartOptions.colorAxis.max = this.maxYValue;
        const data = this.extractTimeData('2017/01');
        this.chartOptions.series = [{
          data: data,
          mapData: mapData,
          joinBy: 'hc-key',
          nullInteraction: true,
          // nullColor: '#FFFFFF',
        }];
        this.ready = true;
      });
    });
  }

  onSelectChange(value) {
    this.identifier = value;
    const date = this.extractMapDate(this.someRange);
    const data = this.extractTimeData(date, value);
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

  onSliderChange(value) {
    const date = this.extractMapDate(value);
    const data = this.extractTimeData(date);
    this.updateChart(data);
  }

  onAutoPlayChange(value) {
    this.autoPlay = !this.autoPlay;
    console.log('triggered');
    console.log(this.autoPlay);
    if (this.autoPlay === true) {
      this.simpleTimer.newTimer('AutoPlay', 0.05);
      this.simpleTimer.subscribe('AutoPlay', () => {
        console.log('tick');
        if (this.someRange < this.maxTimeValue) {
          this.someRange++;
          this.onSliderChange(this.someRange);
        } else {
          this.simpleTimer.delTimer('AutoPlay');
        }
      });
    } else {
      this.simpleTimer.delTimer('AutoPlay');
    }
  }

  saveChartInstance(chartInstance) {
    this.chart = chartInstance;
  }

  onChartRender(chartInstance) {
    if (this.averageData == null) {
      this.averageData = this.getAverage();
    }
  }

  saveDetailChartInstance(chartInstance) {
    this.detailChart = chartInstance;
  }

  onPointSelect(county = this.selectedCounty) {
    county = county.context.properties.name.toLowerCase();
    this.selectedCounty = county;
    this.updateDetailChart(county);
  }

  onDetailPointSelect(point) {
    this.someRange = point.context.x;
  }

  private updateChart(data, mapData = this.mapData, chart = this.chart) {
    chart.series[0].update({
      data: data,
      mapData: mapData,
      joinBy: 'hc-key',
    });
  }

  private updateDetailChart(county = this.selectedCounty) {
    const countyData = this.extractCountyData(county);

    const data = countyData.map(it => {
      return [it[0], it[1]];
    });
    const dates = Array.from(new Set(countyData.map(it => it[0])));

    if (this.averageData == null) {
      this.averageData = this.getAverage();
    }

    this.detailChartOptions.series = [{
      data: data,
      name: county.toUpperCase(),
    }, {
      data: this.averageData[0],
      name: 'AVERAGE',
    }];
    this.detailChartOptions.xAxis.categories = dates;
    this.detailChartOptions.yAxis.max = this.extractMaxLenght();

    this.detailChartOptions.chart.width = this.detailDiv.nativeElement.offsetWidth;
    this.detailChartOptions.chart.height = '490px';

    if (this.detailChart != null) {
      this.detailChart.update(this.detailChartOptions);
    }
  }

  private extractTimeData(timePeriod, identifier = this.identifier, data = this.countyData) {
    return this.extractData(data.filter(entry => entry.YEAR_WEEK === timePeriod), identifier);
  }

  private extractCountyData(county, identifier = this.identifier, data = this.countyData) {
    return data
      .filter(it => it.COUNTY === county)
      .map(it => {
        return [it.YEAR_WEEK, it[identifier]];
      });
  }


  private extractData(data, identifier) {
    return data.map(entry => {
      return {
        'hc-key': entry.GEOJSONID.toLowerCase(),
        'value': entry[identifier]
      };
    });
  }

  private getAverage(data = this.countyData) {
    const categories = Array.from(new Set(data.map(it => it.YEAR_WEEK)));
    const averages = [];
    const cumulative = [];

    categories.forEach(categorie => {
      const timeData = this.extractTimeData(categorie).map(it => it.value);
      const sum = timeData.reduce((a, b) => a + b);
      cumulative.push([categorie, sum]);
      const avg = sum / timeData.length;
      averages.push([categorie, avg]);
    });

    return [averages, cumulative];
  }

  private extractMaxLenght(identifier = this.identifier, data = this.countyData) {
    data = data
      .map(it => it[identifier]);
    return Math.max.apply(Math, data);
  }

  private extractMapDate(number) {
    const extraYears = absFloor(number / 53);

    let week = (number % 53);
    if (extraYears >= 1) {
      week += 1;
    }

    week = week.toString();
    if (week.length === 1) {
      week = `0${week}`;

    }
    const year = 2016 + extraYears;

    return `${year}/${week}`;
  }
}

