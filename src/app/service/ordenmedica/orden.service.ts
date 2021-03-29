import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { OrdenMedica } from 'src/app/models/orden-medica/OrdenMedica';
import { CrearPrestacionesOrdMed } from 'src/app/models/orden-medica/CrearPrestacionesOrdMed';
import { FinalizarOrdenMedica } from 'src/app/models/orden-medica/FinalizarOrden';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  require: any;
  sessionUser: any = this.authenticatedService.getUser();
  params: any;



  constructor(private http: HttpClient,
    private authenticatedService: AuthenticatedService) { }

  getDetailOrden(ormIdOrdmNumero: number) {
    return this.http.get<OrdenMedica>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/detalleOrdenMedica/' + ormIdOrdmNumero);
  }

  createDetailOrden(adminOrdenMedica: any) {
    try {
      adminOrdenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe = adminOrdenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe.id;
    } catch (error) {

    }

    return this.http.post<any>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/administrarOrdenMedica', adminOrdenMedica);
  }

  createPrestaciones(prestaciones: CrearPrestacionesOrdMed) {
    return this.http.post<CaPrestacionesOrdMed[]>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/crearPrestaciones', prestaciones);
  }

  registrarAutorizacion(caGestionAutorizacion: CaGestionAutorizacion) {
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/registrarAutorizacion', caGestionAutorizacion);
  }

  finalizarOrden(finalizarOrdenMedica: FinalizarOrdenMedica) {
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/finalizarOrden', finalizarOrdenMedica);
  }

  obtenerMotivosEliminacion() {
    return this.http.get<any>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/motivoEliminacion');
  }

  eliminarOrden(ormIdOrdmNumero: string, pcaAgeCodigRecep: string, razon: string) {
    this.params = {
      'ormIdOrdmNumero': ormIdOrdmNumero,
      'pcaAgeCodigRecep': pcaAgeCodigRecep,
      'razon': razon
    };
    return this.http.post<Boolean>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/eliminarOrden', this.params);
  }

  authorizationRegister(detalleCita: any, caGestionAutorizacion: any) {

    this.params = {
      "transactionInfo": {
        "idTransaction": Math.random().toString(36).substring(3)
      },
      "authorizationInfo": {
        "number": detalleCita.idCita, //--autorizacion
        "formNumber": detalleCita.nroFormulario, //nUMERO Formulario     FORCIT.RPA_FOR_NUMERFORMU
        "description": caGestionAutorizacion.gauObservaciones, //pantalla autorizacion
        "authDate": caGestionAutorizacion.gauFechaAutorizacion, //pantalla autorizacion
        "agreementCode": detalleCita.codConvenio[0], //citas_Gestionadas CON_CON_CODIGO
        "authPersonName": detalleCita.nombrePaciente, //pantalla autorizacion
        "CUPS": detalleCita.codigoPrestacion, // cita gestionadas PRE_PRE_CODIGO
        "value": caGestionAutorizacion.gauValorPrestacion, //pantalla autorizacion
        "userCode": caGestionAutorizacion.codUsrCita
      },
      "patientInfo": {
        "patientNumber": detalleCita.pacNum //citas gestionadas PAC_PAC_NUMERO
      }
    };
    let headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token, content-type',
      'Access-Control-Max-Age': '1000'
    });

    return this.http.post<any>(environment.urlAmbulatory + "/service/ambulatory/authorizationRegister", this.params, { headers: headers });

  }


  crearOrdenMedica(data) {
    this.params = {
      'pacPacTipoIdentCodigo': data.tipoDocumento,
      'pacPacRut': data.numeroDocumento,
      'cauDescUsuario': this.sessionUser.cn,
      'nombres': data.nombre,
      'primerApellido': data.primerApellido,
      'segundoApellido': data.segundoApellido,
      'codUsrCita': this.sessionUser.uid
    };
    return this.http.post<any>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/registrarOrdenMedica', this.params);
  }

}

