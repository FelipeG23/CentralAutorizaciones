import { Injectable, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvioCorreoService {
  
  params: any;

  constructor(private http: HttpClient) {}

  sendMail(dataPaciente, dataMail, id, asunto) {
    this.params = {
          'accIdNumero': '1',
          'notIdentificador': id.cGIdCitaNumero,
          'pcaAgeCodigRecep': dataPaciente.myVar.data.codUsrCita,
          'pacnumero': dataPaciente.myVar.data.pacNum,
          'givenName': dataPaciente.myVar.data.nombreCompleto.split(' ')[0],
          'email': {
              'entidad': dataPaciente.myVar.data.nombreCentroAten,
              'estado': this.getEstado(dataMail.estado),
              'estadoId': dataMail.estado,
              'medico': dataPaciente.myVar.data.nombreProf,
              'consultorio': dataPaciente.myVar.data.consultorio,
              'piso': dataPaciente.myVar.data.piso,
              'direccion': dataPaciente.myVar.data.ubicacionSede,
              'ciudad': dataPaciente.myVar.data.ciudad,
              'hora': dataPaciente.myVar.data.horaCita,
              'dia': dataPaciente.myVar.data.fechaCita,
              'asunto': asunto
              },
          'mail': dataPaciente.myVar.data.email
      };
      this.params.mail = 'centralautorizacionesfsfb@gmail.com';
    return this.http.post<any>( environment.url + '/CentralAutoriza/rest/General/email', this.params);
  }

  getEstado(id){
    switch(id){
      case "2": return 'CONFIRMADA';
      case "4": return 'CANCELADA POR PACIENTE';
      case "5": return 'CANCELADA POR MÉDICO';
      case "6": return 'REPROGRAMADA';
    }
  }

}
