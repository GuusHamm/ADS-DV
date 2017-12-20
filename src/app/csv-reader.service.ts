import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {map, tap} from 'rxjs/operators';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) {
  }

  private getData(discriminator: String, week = true): Observable<any[]> {
    let uri = `assets/data_per_${discriminator}`;

    if (week) {
      uri += '_per_week';
    }
    uri += '.json';
    return this.http.get(uri)
      .pipe(
        map(res => <any[]> res),
      );
  }

  getDataPerRegion(): Observable<any[]> {
    return this.getData('region');
  }

  getDataPerCounty(week = true): Observable<any[]> {
    return this.getData('county', week);
  }

  getDataPerWeek(): Observable<any[]> {
    return this.getData('week', false);
  }
}
