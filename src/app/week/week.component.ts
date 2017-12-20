import {Component, OnInit} from '@angular/core';
import {DataService} from '../csv-reader.service';
import {ChartService} from '../chart.service';

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})
export class WeekComponent implements OnInit {
  data = null;
  ready = false;

  chartOptions = null;

  constructor(
    private dataService: DataService,
    private chartService: ChartService) {
  }

  ngOnInit() {
    this.chartOptions = this.chartService.getChartOptions();
    this.dataService.getDataPerWeek().subscribe(data => {
      this.data = data;

      const series = [
        this.chartService.getSerie(data, 'TOTAL # VIOLATIONS', 'area', 1),
        this.chartService.getSerie(data),
      ];
      console.log(series);
      const dates = Array.from(new Set(data.map(entry => entry.YEAR_WEEK)));

      // console.log(series);

      this.chartOptions.series = series;
      this.chartOptions.xAxis.categories = dates;
      this.ready = true;
    });
  }

  getViolations(data) {
    const range = (start, end) => Array.from({length: (end - start)}, (v, k) => `VIOLATION_${k + start}`);
    const results = [];

    range(1, 17).forEach(violation => {
      results.push({
        name: violation,
        data: data
          .map(entry => entry[violation]),
      });
    });
    console.log(results);
    return results;
  }

}
