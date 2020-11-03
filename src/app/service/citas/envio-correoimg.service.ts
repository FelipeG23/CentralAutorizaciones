import { Injectable, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvioCorreoimgService {
  
  params: any;

  constructor(private http: HttpClient) {}

  sendMail(dataPaciente, dataMail, id, asunto) {
        var datecita = dataPaciente.myVar.data.CITA;
        datecita = datecita.split(' ')[0];
        var hour = dataPaciente.myVar.data.CITA;
        hour = hour.split(' ')[1];
        hour = hour.replace(':00','');
    this.params = {
          'accIdNumero': '1',
          'notIdentificador': id.cGIdCitaNumero,
          'pcaAgeCodigRecep': dataPaciente.myVar.data.codUsrCita,
          'pacnumero': dataPaciente.myVar.data.pacNum,
          'givenName': dataPaciente.myVar.data.NOMBRES + ' ' + dataPaciente.myVar.data.APELLIDOS,
          'email': {
              'entidad': dataPaciente.myVar.data.SERVICIO,
              'estado': this.getEstado(dataMail.estado),
              'estadoId': dataMail.estado,
              'medico': "",
              'consultorio': "",
              'piso': "",
              'direccion': "",
              'ciudad': "",
              'hora': hour,
              'dia': datecita,
              'asunto': asunto
              },
          'mail': dataPaciente.myVar.data.EMAIL
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
