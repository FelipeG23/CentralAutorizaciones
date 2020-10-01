import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map, startWith } from 'rxjs/operators';

const CACHE_KEY = 'httpBenefitsDonCache';

@Injectable({
  providedIn: 'root'
})
export class BenefitsDocService {
  uri: string = 'http://motorconvenios.co/api/';
  // uri: string = 'http://dondoctorrey.azurewebsites.net/api/';
  params = this.cookie.check('donDoctor') ? JSON.parse(this.cookie.get('donDoctor')) : 'CentalFSFB';
  headers;
  benefitsDon: any;

  constructor(private http: HttpClient,
              private cookie: CookieService) {
                this.headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.params.access_token
                });
  }

  getBenefitsDonDoctor() {
    this.benefitsDon = this.http.get<any>( this.uri + 'prestaciones?serviceTypeID=3&insuranceID=316&insurancePlanID=631&all=true',
    { headers: this.headers })
    .pipe(
      map(data => data)
    );
    this.benefitsDon.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.benefitsDon = this.benefitsDon.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.benefitsDon;
  }

}
