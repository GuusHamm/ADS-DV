import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs/operators";

@Injectable()
export class MapService {

  constructor(private http: HttpClient) {
  }

  getNYMap(): Observable<any> {
    return this.http.get('assets/us-ny-all.geo.json');
  }

}
