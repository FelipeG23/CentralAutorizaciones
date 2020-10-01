import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map, startWith } from 'rxjs/operators';

const CACHE_KEY = 'httpBenefitDonCache';

@Injectable({
  providedIn: 'root'
})
export class BenefitDocService {
  uri: string = 'http://motorconvenios.co/api/';
  // uri: string = 'http://dondoctorrey.azurewebsites.net/api/';
  params = this.cookie.check('donDoctor') ? JSON.parse(this.cookie.get('donDoctor')) : 'CentalFSFB';
  headers;
  benefitDon: any;

  constructor(private http: HttpClient,
              private cookie: CookieService) {
                this.headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.params.access_token
                });
  }

  getBenefitDonDoctor() {
    this.benefitDon = this.http.get<any>( this.uri + 'tiposdeprestacion?all=true',
      { headers: this.headers })
    .pipe(
      map(data => data)
    );
    this.benefitDon.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.benefitDon = this.benefitDon.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.benefitDon;
  }

}
