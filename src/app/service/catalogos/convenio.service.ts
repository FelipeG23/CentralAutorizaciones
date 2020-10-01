import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { AuthenticateDocService } from '../dondoctor/authenticate-doc.service';
import { Listaubicacion } from 'src/app/models/ubicacion/listaubicacion';

const CACHE_KEY = 'httpConvenioCache';

@Injectable({
  providedIn: 'root'
})
export class ConvenioService {
  
  params = this.cookie.check('donDoctor') ? JSON.parse(this.cookie.get('donDoctor')) : 'CentalFSFB';
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + this.params.access_token
  });

  constructor(private http: HttpClient,
              private cookie: CookieService) {}

  getConvenio() {
    return this.http.get<any>( environment.api + '/listas/convenios');
  }

  getInfoConvenio(info) {
    this.params = JSON.parse(this.cookie.get('donDoctor'));
    if(this.cookie.check('donDoctor') && this.params.access_token){
      this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.params.access_token
      });
    }
      
  // https://motorconvenios.co/api/convenio?cups=890282&convenioID=203
    return this.http.get<any>(
      'https://motorconvenios.co/api/convenio?cups=' + info.codigoPrestacion.trim() + '&convenioID=' +
      info.codConvenio, { headers: this.headers });
  }

  getUbicaciones(){
    return this.http.get<Listaubicacion>(environment.api +  '/listas/ubicacionSedes')
  }

}
