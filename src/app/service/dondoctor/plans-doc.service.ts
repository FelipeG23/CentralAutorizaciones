import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map, startWith } from 'rxjs/operators';

const CACHE_KEY = 'httpPlanDonCache';

@Injectable({
  providedIn: 'root'
})
export class PlansDocService {
  uri: string = 'http://motorconvenios.co/api/';
  // uri: string = 'http://dondoctorrey.azurewebsites.net/api/';
  params = this.cookie.check('donDoctor') ? JSON.parse(this.cookie.get('donDoctor')) : 'CentalFSFB';
  headers;
  planDon: any;

  constructor(private http: HttpClient,
              private cookie: CookieService) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.params.access_token
    });
  }

  getPlansDonDoctor() {
    this.planDon = this.http.get<any>( this.uri + 'planes?id=316', { headers: this.headers })
    .pipe(
      map(data => data)
    );
    this.planDon.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.planDon = this.planDon.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.planDon;
  }
}
