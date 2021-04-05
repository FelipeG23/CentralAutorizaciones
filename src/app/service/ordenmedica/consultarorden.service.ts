import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';
import { CaPrestacionesOrdMed } from "src/app/models/orden-medica/CaPrestacionesOrdMed";
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConsultarordenService {
  params: any;

  sessionUser: any = this.authenticatedService.getUser();

  constructor(private http: HttpClient,
    private authenticatedService: AuthenticatedService,
    private cookie: CookieService) { }

  filterOrden(data) {

    this.params = {
      'pacPacTipoIdentCodigo': data.tipoDocumento,
      'pacPacRut': data.numeroDocumento,
      'cauDescUsuario': this.sessionUser.cn,
      'nombres': data.nombre,
      'primerApellido': data.primerApellido,
      'segundoApellido': data.segundoApellido,
      'codUsrCita': this.sessionUser.uid
    };
    return this.http.post<any>(environment.url + '/CentralAutorizav2/rest/ordenesMedicas/consultarOrdenMedica', this.params);
  }

  filterOrdenes(data, estados) {

    
    const fechaInicial = this.convertDate(data.fecha);
    const fechaFinal = this.convertDate(data.fechaFinal);

    
    this.params = {
      'fechaInicial': fechaInicial,
      'fechaFinal': fechaFinal,
      'estados': estados,
      'pacPacTipoIdentCodigo': data.tipoDocumento,
      'pacPacRut': data.numeroDocumento,
      'cauDescUsuario': this.sessionUser.cn,
      'nombres': data.nombre,
      'primerApellido': data.primerApellido,
      'segundoApellido': data.segundoApellido,
      'codUsrCita': this.sessionUser.uid
    };
    
    
    return this.http.post<any>(environment.api + '/OrdenMedica/getOrdenes', this.params);
  }

  filterOrdenesMedicas(data, estados) {


    let date = new Date();
      
    let fechInicial = new Date(date.getFullYear(), date.getMonth(), date.getDate() -240);
    let fechaInicialAuto =  moment(fechInicial);
    let fechaInicial = this.convertDate(fechaInicialAuto);

    console.log(fechaInicial);
    

    let fechFinal = new Date(date.getFullYear(), date.getMonth(), date.getDate() +1);
    let fechaFinallAuto =  moment(fechFinal);
    let fechaFinal = this.convertDate(fechaFinallAuto);


    console.log(fechaFinal);
    

    this.params = {
      'fechaInicial': fechaInicial,
      'fechaFinal': fechaFinal,
      'estados': [1, 2],

      
    };

    return this.http.post<any>(environment.api + '/OrdenMedica/getOrdenes', this.params);

  }


  consultaPrestaciones(consultaPrestaciones: CaPrestacionesOrdMed) {
    return this.http.post<CaPrestacionesOrdMed[]>(environment.url +
      '/CentralAutorizav2/rest/ordenesMedicas/consultaPrestaciones', consultaPrestaciones);
  }

  convertDate(date: any) {
    let newDate = date.date();
    if (date.date() < 10) {
      newDate = '0' + date.date();
    }
    let mes = (date.month() + 1);
    if (mes < 10) {
      mes = '0' + mes;
    }
    return newDate + '/' + mes + '/' + date.year();
  }

  consultarPrestacion(prestacion: number): Observable<CaPrestacionesOrdMed> {
    const url = environment.url + `/CentralAutorizav2/rest/ordenesMedicas/consultarPrestacion/${prestacion}`;
    return this.http.get<CaPrestacionesOrdMed>(url);
  }

  validarGestionContinuidad(ormIdOrdmNumero: number): Observable<boolean> {
    const url = environment.api + `/OrdenMedica/validarGestionContinuidad/${ormIdOrdmNumero}`;
    return this.http.get<boolean>(url);
  }

}
