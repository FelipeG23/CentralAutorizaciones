import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CaGestionAutorizacionCita } from '../../models/orden-medica/CaGestionAutorizacionCita';
import { Observable } from 'rxjs';
import { CaPolizasPaciente } from '../../models/caPolizasPaciente';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { FiltroDetalleCita } from 'src/app/models/filtro-detalle.cita';
import { DetalleCita } from 'src/app/models/detalle-cita';

@Injectable({
  providedIn: 'root'
})
export class DetalleCitaService {

  constructor(private http: HttpClient) { }

 
  registrarAutorizacion(caGestionAutorizacionCita: CaGestionAutorizacionCita) {
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ClienteCita/registrarAutorizacion', caGestionAutorizacionCita);
  }

  registrarAutorizacionImg(caGestionAutorizacionCita: CaGestionAutorizacionCita) {
    let caGestionAutorizacionCitas = caGestionAutorizacionCita;
    caGestionAutorizacionCita.codUsrCita = "FSM04389",
    caGestionAutorizacionCita.pacNum = 548110;
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ClienteCita/registrarAutorizacion', caGestionAutorizacionCita);
  }

  consultarValor(dataUser) {
    return this.http.post<any>(environment.api + '/recaudo/consultaValoresPrestaciones', dataUser)
  }

  consultarPoliza(pacNum: number): Observable<CaPolizasPaciente> {
    const url = environment.url + `/CentralAutoriza/rest/ClienteCita/poliza/${pacNum}`;
    return this.http.get<CaPolizasPaciente>(url);
  }

  registrarAutorizacionPrestacion(caGestionAutorizacion: CaGestionAutorizacion) {
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ClienteCita/registrarAutorizacionPrestacion', caGestionAutorizacion);
  }

  consultarDetalleCita(filtroDetalleCita: FiltroDetalleCita): Observable<DetalleCita> {
    return this.http.post<DetalleCita>(environment.url + '/CentralAutoriza/rest/ClienteCita/consultarDetalleCitaPaciente', filtroDetalleCita);
  }
}
