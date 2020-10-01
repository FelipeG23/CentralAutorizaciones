import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map, startWith } from 'rxjs/operators';

const CACHE_KEY = 'httpAgreementsDonCache';

@Injectable({
  providedIn: 'root'
})
export class AgreementsDocService {
  uri: string = 'http://motorconvenios.co/api/';
  // uri: string = 'http://dondoctorrey.azurewebsites.net/api/';
  params = this.cookie.check('donDoctor') ? JSON.parse(atob(this.cookie.get('donDoctor'))) : 'CentalFSFB';
  headers;
  agreementsDon: any;

  constructor(private http: HttpClient,
              private cookie: CookieService) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.params.access_token
    });
  }
  // convenio?cups=890282&convenioID=203
  // convenio?serviceID=1133&insuranceID=316&insurancePlanID=631
  getAgreementsDonDoctor() {
    this.agreementsDon = this.http.get<any>( this.uri + 'convenio?cups=890282&convenioID=203',
      { headers: this.headers })
    .pipe(
      map(data => data)
    );
    this.agreementsDon.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.agreementsDon = this.agreementsDon.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.agreementsDon;
  }

}
