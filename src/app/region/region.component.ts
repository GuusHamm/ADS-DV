import {Component, OnInit} from '@angular/core';
import {DataService} from '../csv-reader.service';
import * as Highcharts from "highcharts";
import {MapService} from "../map.service";

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss']
})
export class RegionComponent implements OnInit {
  ready = false;

  data = null;
  regions = null;

  selectors = [
    'COMMENT_LENGTH',
    'COMMENT_LENGTH_PER_VIOLATION',
    'TOTAL # CRITICAL VIOLATIONS',
    'TOTAL #CRIT.  NOT CORRECTED ',
    'TOTAL # NONCRITICAL VIOLATIONS',
    'TOTAL # VIOLATIONS'
  ];

  chartTypes = [
    'area',
    'line'
  ];

  chartOptions = {
    chart: {
      type: 'line',
      height: '1000px',
      zoomType: 'x'
    },
    plotOptions: {
      area: {
        stacking: 'percent',
        lineWidth: 1,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true
            }
          }
        },
      },
      line: {
        marker: {
          enabled: false
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
    series: null,
  };

  constructor(private dataService: DataService,
              private mapService: MapService) {
  }

  ngOnInit() {
    this.mapService.getNYMap().subscribe(data => {

    });
    console.log('banaan');
    this.dataService.getDataPerRegion().subscribe(data => {
        this.data = data;
        this.regions = new Set(data.map(entry => entry.REGION));
        const dates = Array.from(new Set(data.map(entry => entry.YEAR_WEEK)));
        const series = this.getSeries(this.regions, data);

        console.log(series);

        this.chartOptions.series = series;
        this.chartOptions.xAxis.categories = dates;
        this.ready = true;
      }
    );
  }

  getSeries(regions, data, map_value = 'COMMENT_LENGTH') {
    const results = [];
    regions.forEach(region => {
      results.push({
        name: region,
        data: data
          .filter(entry => entry.REGION === region)
          .map(entry => entry[map_value]),
        visible: true,
      });
    });
    return results;
  }

  onSelectorChange(value) {
    this.chartOptions.series = this.getSeries(this.regions, this.data, value);
  }

  onChartTypeChange(value) {
    console.log(value);
    this.chartOptions.chart.type = value;
  }
}
