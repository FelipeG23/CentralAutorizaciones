import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadService {

  constructor(private http: HttpClient) {}

  getTrazaId (dataTraza)  {
    return this.http.get<any>(
      environment.url + '/CentralAutoriza/rest/ClienteCita/consultarTrazabilidadCita/' + dataTraza.cGIdCitaNumero);
  }

  getTraza (dataTraza)  {
    return this.http.post<any>(
      environment.url + '/CentralAutoriza/rest/ClienteCita/consultarTrazabilidadCita', dataTraza);
  }

  getTrazaOrden (dataTraza)  {
    return this.http.get<any>(
      environment.url + '/CentralAutoriza/rest/ClienteCita/consultarTrazabilidadOrden/' + dataTraza.ormIdOrdmNumero);
  }


  

}
