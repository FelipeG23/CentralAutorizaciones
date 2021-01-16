import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CieService {
  params: any;
  constructor(private http: HttpClient) {}

  getCie() {
    this.params = {
      'codPrestacion': 'ANES'
    };
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/Catalogo/CIE', this.params);
  }

  getCieWithService(service: string) {
    this.params = {
      'codPrestacion': service
    };
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/Catalogo/CIE', this.params);
  }
}
