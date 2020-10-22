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

  registrarAutorizacion(caGestionAutorizacionCitas: CaGestionAutorizacionCita) {

    console.log("Vidal", caGestionAutorizacionCitas);

    let caGestionAutorizacionCita = {
      'centroAtencion': "CENTRO MADRID FSFB-GUSTAVO ESCALLÓN CAYZEDO",
      'codUsrCita': "FSM04389",
  'enviarCorreo': true,
'fechaCita': "2020/03/02",
'gauAutorizaServ': "1",
'gauCodigoAutorizacion': "12345",
'gauCostoConvenio': 0,
'gauCostoPac': 0,
'gauFechaAutorizacion': caGestionAutorizacionCitas.gauFechaAutorizacion,
'gauFechaVencAutorizacion': caGestionAutorizacionCitas.gauFechaVencAutorizacion,
'gauNombreAutorizador': "2",
'gauObservaciones': "kkekfnenfkenfke",
'gauTelefonoAutorizador': 12344,
'gauValorPrestacion': 12334,
'gauVigenciaAutorizacion': 3,
'horaCita': "07:40",
'mnaIdcodigo': null,
'nombrePaciente': "MARINA VIZCAINO RIVEROS",
'numeroPoliza': "655449",
'omnDesc': null,
'pacNum': 548110,
'pcaAgeCodigoRecep': "53101149"

    }
    console.log(caGestionAutorizacionCita);
    
    
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
