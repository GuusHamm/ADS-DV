import {Injectable} from '@angular/core';

@Injectable()
export class ChartService {
  private chartOptions;

  constructor() {
    this.chartOptions = {
      chart: {
        type: 'line',
        height: '1000px',
        zoomType: 'x'
      },
      plotOptions: {
        area: {
          stacking: 'normal',
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
  }

  getChartOptions(): any {
    return this.chartOptions;
  }

  getSerie(data, map_value = 'COMMENT_LENGTH', type = 'line', yAxis = 0) {
    return {
      name: map_value,
      type: type,
      yAxis: yAxis,
      data: data
        .map(entry => entry[map_value]),
    };
  }
}
