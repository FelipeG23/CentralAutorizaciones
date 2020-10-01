import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map, startWith } from 'rxjs/operators';

const CACHE_KEY = 'httpBusinessDonCache';

@Injectable({
  providedIn: 'root'
})
export class BusinessDocService {
  uri: string = 'http://motorconvenios.co/api/';
  // uri: string = 'http://dondoctorrey.azurewebsites.net/api/';
  params = this.cookie.check('donDoctor') ? JSON.parse(this.cookie.get('donDoctor')) : 'CentalFSFB';
  headers;
  businessDon: any;

  constructor(private http: HttpClient,
              private cookie: CookieService) {
                this.headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.params.access_token
                });
  }

  getBusinessDonDoctor() {
    this.businessDon = this.http.get<any>( this.uri + 'empresas?all=true',
    { headers: this.headers })
    .pipe(
      map(data => data)
    );
    this.businessDon.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.businessDon = this.businessDon.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.businessDon;
  }
}
