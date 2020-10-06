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
      convenios = lista.map(data => data.id)
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
    }

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

  getConvenio(){
    return this.http.get(environment.api + `/listas/convenios`);
  }


  getCitasAutorizadas() {

    let convenios = 3;

    let date = new Date();
      
    let fechInicial = new Date(date.getFullYear(), date.getMonth(), date.getDate() -14);
    let fechaInicialAuto =  moment(fechInicial);
    // let datosFechaInicial = this.convertDate(fechaInicialAuto);

    let fechFinal = new Date(date.getFullYear(), date.getMonth(), date.getDate() +1);
    let fechaFinallAuto =  moment(fechFinal);
    let datosFechaFinal = this.convertDate(fechaFinallAuto);
  
    let minDateValue = new Date(date.getFullYear(), 1, 1);
    let diego  = moment(minDateValue);
    let datosFechaInicial = this.convertDate(diego);



      console.log("Vidal Guiza", diego);
  


    this.params = {
      'convenios': [],
      'estado': convenios,
      'fechaInicial': datosFechaInicial,
      'fechaFinal': datosFechaFinal,
      'nombreSede': "",
      'nombres': "",
      'numDocId': "",
      'primerApellido': "",
      'segundoApellido': "",
      'numDtipoDocIdocId': "",
    };
    

    return this.http.post<any>( environment.api + '/citas', this.params);
  }




}
