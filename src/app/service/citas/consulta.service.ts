import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  params;
  minDateValue = new Date();
  constructor(private http: HttpClient) {}
  getCitas(userData, lista) {
    let convenios;
    if (lista !== '') {
      convenios = lista.map(data => data.id);
    }
    const fechaInicial = this.convertDate(userData.fecha);
    const fechaFinal = this.convertDate(userData.fechaFinal);
    this.params = {
      'fechaInicial': fechaInicial,
      'fechaFinal': fechaFinal,
      'numDocId': userData.numeroDocumento.toString(),
      'nombres': userData.nombre,
      'primerApellido': userData.primerApellido,
      'segundoApellido': userData.segundoApellido,
      'tipoDocId': userData.tipoDocumento,
      'codCentroAten': userData.sede.id,
      'codEspecialidad': userData.especialidad.id,
      'codSubEspecialidad': userData.subEspecialidad.id,
      'codServicio': userData.servicio.id,
      'convenios': lista === '' ? userData.convenio : convenios,
      'estado': userData.estado,
      'nombreSede': userData.ubicacionesFilter
    };
    return this.http.post<any>( environment.api + '/citas', this.params);
  }

  getCitasPorAutorizar(data) {
    this.params = {
      'fechaInicial': this.convertDate(data.fecha),
      'fechaFinal': this.convertDate(data.fechaFinal),
    };

    return this.http.post<any>( environment.api + '/citas/porautorizar', this.params);
  }

  updateAsistencia(citaId, estado) {
    return this.http.put<any>( environment.api + '/citas/' + citaId + '/update-asistencia', estado);
  }

  convertDate(date: any) {
    let newDate = date.date();
    if (date.date() < 10) {
      newDate = '0' + date.date();
    }
    let mes = (date.month() + 1);
    if ( mes < 10) {
      mes = '0' + mes;
    }
    return newDate + '/' + mes + '/' + date.year();
  }

  getCitaById(idCita: number): Observable<any> {
    this.params = {
      'idCita': idCita,
    };
    return this.http.post<any>( environment.api + '/citas/byId', this.params);
  }

  getConvenio() {
    return this.http.get(environment.api + `/listas/convenios`);
  }

  getImagenesDiagnosticas(data) {
    this.params = {
      'fecha': this.convertDate(data.fecha),
      'fechaFinal': this.convertDate(data.fechaFinal),
      'PatiendId' : data.patientId
    };
    // tslint:disable-next-line: max-line-length
    return this.http.get(environment.imgDiagnosticas + '/GetAppointmenstList?FechaInicial=' + this.convertDate(data.fecha) + '&FechaFinal=' + this.convertDate(data.fechaFinal) + '&PatientId=' + data.patientId);
  }

  getCitasAutorizadas() {
    const convenios = 3;
    const date = new Date();
    const fechInicial = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 14);
    const fechaInicialAuto =  moment(fechInicial);
    // let datosFechaInicial = this.convertDate(fechaInicialAuto);
    const fechFinal = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const fechaFinallAuto =  moment(fechFinal);
    const datosFechaFinal = this.convertDate(fechaFinallAuto);
    const minDateValue = new Date(date.getFullYear(), 1, 1);
    const data  = moment(minDateValue);
    const datosFechaInicial = this.convertDate(data);

    this.params = {
      'convenios': [],
      'estado': convenios,
      'fechaInicial': datosFechaInicial,
      'fechaFinal': datosFechaFinal,
      'nombreSede': '',
      'nombres': '',
      'numDocId': '',
      'primerApellido': '',
      'segundoApellido': '',
      'numDtipoDocIdocId': '',
    };

    return this.http.post<any>( environment.api + '/citas', this.params);
  }

  postCitasAutorizadas(page: number, size: number): Observable<any> {
    return this.http.get<any>(environment.api + `/listas/citasAuto?page=${page}&size=${size}`);
    // return this.http.get<any>( environment.api + '/listas/citasAutorizadas');
  }

}
