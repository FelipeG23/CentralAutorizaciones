import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CACHE_KEY = 'httpClasificacionCache';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionService {

  params: any;
  constructor(private http: HttpClient) {}

  getClasificacion() {
    this.params = {
      'codigoEspec': '3',
      'codSubEspec': '006'
    };
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/Catalogo/ClasifiConsult',this.params);
  }
}
