import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CambiocitaimgService {

  params: any;
  session: any = this.authenticatedService.getUser();

  constructor(private http: HttpClient,
              private authenticatedService: AuthenticatedService,
              private cookie: CookieService) {}

  changeAppointment(datosDeCita, datosDeCambio) {

    var str = datosDeCita.myVar.data.IDENTIFICACION;
    var chars = str.slice(0, str.search(/\d/));
    var numbs = str.replace(chars,'');
    var datecita = datosDeCita.myVar.data.CITA;
    datecita = datecita.split(' ')[0];
    var dateAsigna = datosDeCita.myVar.data.FECHAAGENDAMIENTO;
    dateAsigna = dateAsigna.split(' ')[0];
    var hour = datosDeCita.myVar.data.CITA;
    hour = hour.split(' ')[1];
    hour = hour.replace(':00','');
    let codConv = [];
    codConv.push(datosDeCita.myVar.data.CONVENIO);
    this.params = {
      'ecIdCodigo': datosDeCambio.estado ,
      'pcaAgeCodigRecep': this.session.uid,
      'cauDescUsuarios': this.session.cn,
      'otcObservacion': datosDeCambio.observacion,
      'correoElectronicoPaciente': datosDeCambio.sendEmail === 'true' ? true : false,
      'ecPolizaNumero': datosDeCambio.numeroPoliza,
      'pacNum': parseInt(datosDeCita.myVar.data.CUPS),
      'nombreCompleto': datosDeCita.myVar.data.NOMBRES + ' ' + datosDeCita.myVar.data.APELLIDOS,
      'pacPacTipoIdentCodigo': 4,
      'tipoDocId': 4,
      'tipTipIDav': chars,
      'numDocId': numbs,
      'telefono': datosDeCita.myVar.data.CELULAR,
      'email': datosDeCita.myVar.data.EMAIL,
      'horaCita': hour,
      'fechaCita': datecita,
      'codEspecialidad': "Imagenes diagnosticas",
      'especialidad': datosDeCita.myVar.data.EXAMEN,
      'codProf': "",
      'nombreProf': "",
      'consultorio': "",
      'codigoPrestacion': "",
      'prestacion': datosDeCita.myVar.data.EXAMEN,
      'codCentroAten': "",
      'nombreCentroAten': datosDeCita.myVar.data.SERVICIO,
      'codConvenio': codConv,
      'convenio': datosDeCita.myVar.data.NOMBRECONVENIO,
      'codUsrCita': 'FSM04389',
      'usrCita': 'FSM04389',
      'fechaAsigna': dateAsigna,
      'indRecepcionado': datosDeCita.myVar.data.indRecepcionado,
      'direccionCentroOperativo': "",
      'telefonoCentroOperativo': datosDeCita.myVar.data.P_PHONE,
      'codServicio': datosDeCita.myVar.data.IDCITA,
      'tipoCita': datosDeCambio.tipoCita,
      'detalleEstado': datosDeCambio.detalleEstado,
    };
    
    console.log(this.params);
    //this.params.email = 'centralautorizacionesfsfb@gmail.com';
    return this.http.post<any>( environment.url + '/CentralAutoriza/rest/ClienteCita/cambiarEstadoCita', this.params);
  }

}
