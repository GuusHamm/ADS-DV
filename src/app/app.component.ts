import {Component, OnInit} from '@angular/core';
import {DataService} from './csv-reader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'app';



  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
  }
}
