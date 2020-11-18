import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';
import { AdminOrdenMedica } from 'src/app/models/orden-medica/AdminOrdenMedica';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { OrdenMedica } from 'src/app/models/orden-medica/OrdenMedica';
import { CrearPrestacionesOrdMed } from 'src/app/models/orden-medica/CrearPrestacionesOrdMed';
import { FinalizarOrdenMedica } from 'src/app/models/orden-medica/FinalizarOrden';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { analytics } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {

  sessionUser: any = this.authenticatedService.getUser();
  params: any;

  constructor(private http: HttpClient,
    private authenticatedService: AuthenticatedService,
    private cookie: CookieService) { }

  getDetailOrden(ormIdOrdmNumero: number) {
    return this.http.get<OrdenMedica>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/detalleOrdenMedica/' + ormIdOrdmNumero);
  }

  createDetailOrden(adminOrdenMedica: any) {

    //  AdminOrdenMedica

    console.log("Test 10", adminOrdenMedica);

    /*
    var adminOrdenMedicas = {};
    adminOrdenMedicas = {
      'conConCodigo': "3205",
      'diaAgrCodigo': "1       ",
      'diaOtroAgr': "Autorizacion de prueba",    
      'dorFechaOrdenmString': "2020-11-17T05:00:00.000Z",
      'ecPolizaNumero': "SEGUROS BOLIVAR",
      'ormIdOrdmNumero': 28947,
      'pacPacNumero': 984386,
      'pacPacRut': "1013276086",
      'pacPacTipoIdentCodigo': "2",
      'pcaAgeCodigProfe': "16692093",
      'pcaAgeCodigRecep': "53101149",
      'pcaAgeLugar': "IMAD",
      'serEspCodigo': "9",
      'serSerCodSubEspe': "012",
      'serSerCodigo': "ORTOCHIA",
      'codUsrCita': "53101149",
    };

    console.log(adminOrdenMedicas);  */
    
    
    return this.http.post<any>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/administrarOrdenMedica', adminOrdenMedica);
  }

  createPrestaciones(prestaciones: CrearPrestacionesOrdMed) {
    return this.http.post<CaPrestacionesOrdMed[]>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/crearPrestaciones', prestaciones);
  }

  registrarAutorizacion(caGestionAutorizacion: CaGestionAutorizacion) {
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/registrarAutorizacion', caGestionAutorizacion);
  }

  finalizarOrden(finalizarOrdenMedica: FinalizarOrdenMedica) {
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/finalizarOrden', finalizarOrdenMedica);
  }

  obtenerMotivosEliminacion() {
    return this.http.get<any>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/motivoEliminacion');
  }

  eliminarOrden(ormIdOrdmNumero: string,pcaAgeCodigRecep: string,razon: string) {
    this.params = {
      'ormIdOrdmNumero': ormIdOrdmNumero,
      'pcaAgeCodigRecep': pcaAgeCodigRecep,
      'razon' : razon
    };
    return this.http.post<Boolean>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/eliminarOrden', this.params);
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
    return this.http.post<any>(environment.url + '/CentralAutoriza/rest/ordenesMedicas/registrarOrdenMedica', this.params);
  }

}
