import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  constructor(private http: HttpClient) {}

  getSubEspecialidades() {
    return this.http.get<any>( environment.api + '/listas/subespecialidades');
  }

  getServicios() {
    return this.http.get<any>( environment.api + '/listas/servicios');
  }
}
