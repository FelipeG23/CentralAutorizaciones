import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CaGestionAutorizacionCita } from '../../models/orden-medica/CaGestionAutorizacionCita';
import { Observable } from 'rxjs';
import { CaPolizasPaciente } from '../../models/caPolizasPaciente';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { FiltroDetalleCita } from 'src/app/models/filtro-detalle.cita';
import { DetalleCita } from 'src/app/models/detalle-cita';
import { CaGestionAutorizacionCitaWS } from 'src/app/models/orden-medica/CaGestionAutorizacionCitaWS';

@Injectable({
  providedIn: 'root'
})
export class DetalleCitaService {
  idCita:any;
  constructor(private http: HttpClient) { }

 
  registrarAutorizacion(caGestionAutorizacionCita: CaGestionAutorizacionCita) {
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ClienteCita/registrarAutorizacion', caGestionAutorizacionCita);
  }

  registrarAutorizacionWsBus(caGestionAutorizacionCita: CaGestionAutorizacionCitaWS) {
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ClienteCita/registrarAutorizacionWsBus', caGestionAutorizacionCita);
  }

  registrarAutorizacionImg(caGestionAutorizacionCita: CaGestionAutorizacionCita) {
    let caGestionAutorizacionCitas = caGestionAutorizacionCita;
    caGestionAutorizacionCita.codUsrCita = "FSM04389",
    caGestionAutorizacionCita.pacNum = 548110;
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ClienteCita/registrarAutorizacion', caGestionAutorizacionCita);
  }

  consultarValor(dataUser) {
    return this.http.post<any>(environment.api + '/recaudo/consultaValoresPrestaciones', dataUser)
  }

  consultarPoliza(pacNum: number): Observable<CaPolizasPaciente> {
    const url = environment.url + `/CentralAutorizav2/rest/ClienteCita/poliza/${pacNum}`;
    return this.http.get<CaPolizasPaciente>(url);
  }

  registrarAutorizacionPrestacion(caGestionAutorizacion: CaGestionAutorizacion) {
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ClienteCita/registrarAutorizacionPrestacion', caGestionAutorizacion);
  }

  consultarDetalleCita(filtroDetalleCita: FiltroDetalleCita): Observable<DetalleCita> {
    return this.http.post<DetalleCita>(environment.url + '/CentralAutorizav2/rest/ClienteCita/consultarDetalleCitaPaciente', filtroDetalleCita);
  }


  cambioConvenio(caGestionAutorizacion:any) {
    console.log('gestion auth: ',caGestionAutorizacion);
    console.log('id cita llega: ',this.idCita);
    let params;
    //idCita set at autorizar.componeent
    params = {
      idCita: this.idCita,
      idConvenio: caGestionAutorizacion.IdConvenios
    }
    return this.http.post<any>(environment.url + '/fsfb-apiWeb/citas/cambioconvenio', params);
  }
  setIdCita(cita:any){
    this.idCita=cita;
  }

}
