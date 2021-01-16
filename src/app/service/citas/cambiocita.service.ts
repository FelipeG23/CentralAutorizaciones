import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CambiocitaService {

  params: any;
  session: any = this.authenticatedService.getUser();

  constructor(private http: HttpClient,
              private authenticatedService: AuthenticatedService,
              private cookie: CookieService) {}

  changeAppointment(datosDeCita, datosDeCambio) {

    this.params = {
      'ecIdCodigo': datosDeCambio.estado,
      'pcaAgeCodigRecep': this.session.uid,
      'cauDescUsuarios': this.session.cn,
      'otcObservacion': datosDeCambio.observacion,
      'correoElectronicoPaciente': datosDeCambio.sendEmail === 'true' ? true : false,
      'ecPolizaNumero': datosDeCambio.numeroPoliza,
      'pacNum': datosDeCita.myVar.data.pacNum,
      'nombreCompleto': datosDeCita.myVar.data.nombreCompleto,
      'pacPacTipoIdentCodigo': datosDeCita.myVar.data.tipoDocId,
      'tipoDocId': datosDeCita.myVar.data.tipoDocId,
      'tipTipIDav': datosDeCita.myVar.data.tipTipIDav,
      'numDocId': datosDeCita.myVar.data.numDocId,
      'telefono': datosDeCita.myVar.data.telefono,
      'email': datosDeCita.myVar.data.email,
      'horaCita': datosDeCita.myVar.data.horaCita,
      'fechaCita': datosDeCita.myVar.data.fechaCita,
      'codEspecialidad': datosDeCita.myVar.data.codEspecialidad,
      'especialidad': datosDeCita.myVar.data.especialidad,
      'codProf': datosDeCita.myVar.data.codProf,
      'nombreProf': datosDeCita.myVar.data.nombreProf,
      'consultorio': datosDeCita.myVar.data.consultorio,
      'codigoPrestacion': datosDeCita.myVar.data.codigoPrestacion,
      'prestacion': datosDeCita.myVar.data.prestacion,
      'codCentroAten': datosDeCita.myVar.data.codCentroAten,
      'nombreCentroAten': datosDeCita.myVar.data.nombreCentroAten,
      'codConvenio': datosDeCita.myVar.data.codConvenio,
      'convenio': datosDeCita.myVar.data.convenio,
      'codUsrCita': datosDeCita.myVar.data.codUsrCita,
      'usrCita': datosDeCita.myVar.data.usrCita,
      'fechaAsigna': datosDeCita.myVar.data.fechaAsigna,
      'indRecepcionado': datosDeCita.myVar.data.indRecepcionado,
      'direccionCentroOperativo': datosDeCita.myVar.data.direccionCentroOperativo,
      'telefonoCentroOperativo': datosDeCita.myVar.data.telefonoCentroOperativo,
      'codServicio': datosDeCita.myVar.data.codServicio,
      'tipoCita': datosDeCambio.tipoCita,
      'detalleEstado': datosDeCambio.detalleEstado,
    };
    
    console.log(this.params);
    
    //this.params.email = 'centralautorizacionesfsfb@gmail.com';
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/ClienteCita/cambiarEstadoCita', this.params);

  }

}
