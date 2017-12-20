import {Component, OnInit} from '@angular/core';
import {DataService} from '../csv-reader.service';
import {ChartService} from '../chart.service';

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.scss']
})
export class ScatterComponent implements OnInit {

  ready = false;
  chartOptions = null;
  data = null;

  constructor(private dataService: DataService,
              private chartService: ChartService) {
  }

  ngOnInit() {
    const range = (start, end) => Array.from({length: (end - start)}, (v, k) => `VIOLATION_${k + start}`);

    this.chartOptions = this.chartService.getChartOptions();

    console.log(this.chartOptions);

    this.chartOptions.chart.type = 'line';
    this.chartOptions.chart.polar = true;

    this.dataService.getDataPerWeek().subscribe(data => {
      this.data = data;
      const dates = Array.from(new Set(data.map(entry => entry.YEAR_WEEK)));
      this.chartOptions.xAxis.categories = dates;
      
      const series = [];
      // this.getScatter(data, 'COMMENT_LENGTH', 'TOTAL # VIOLATIONS'),
      range(1, 17).forEach(violation => {
        series.push(this.chartService.getSerie(data, violation, 'spline'));
      });
      console.log(series);

      this.chartOptions.series = series;
      this.ready = true;
    });
  }


  getScatter(data, map_value_x, map_value_y) {
    console.log(map_value_y);
    return {
      name: `${map_value_x} ${map_value_y}`,
      data: data.map(entry => [entry[map_value_x], entry[map_value_y]])
    };
  }

}
