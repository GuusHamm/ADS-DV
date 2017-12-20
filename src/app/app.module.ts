import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {DataService} from './csv-reader.service';
import {BsDropdownModule, ButtonsModule, ModalModule} from 'ngx-bootstrap';
import {MapService} from './map.service';
import {MapComponent} from './map/map.component';
import {ChartModule} from 'angular2-highcharts';
import {NouisliderModule} from 'ng2-nouislider';
import {SimpleTimer} from 'ng2-simple-timer';
import {CumulativeComponent} from './cumulative/cumulative.component';
declare var require: any;

const appRoutes: Routes = [
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'cumulative',
    component: CumulativeComponent,
  },
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CumulativeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false},
    ),
    ChartModule.forRoot(
      require('highcharts'),
      require('highcharts/modules/map')
    ),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    NouisliderModule,
    ModalModule.forRoot()
  ],
  providers: [
    DataService,
    MapService,
    SimpleTimer,
  ],
  bootstrap: [AppComponent]
})


export class AppModule {
}
