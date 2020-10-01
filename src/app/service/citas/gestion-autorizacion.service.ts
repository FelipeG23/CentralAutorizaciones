import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GestionAutorizacionCita } from 'src/app/models/gestionAutorizacion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GestionAutorizacionService {

  constructor(private httpClient: HttpClient) { }

  getGestionAutorizacionPorPacNumero(idCita: number): Observable<GestionAutorizacionCita> {
    const url = environment.api + `/gestionAutorizacion/${idCita}`;
    return this.httpClient.get<GestionAutorizacionCita>(url);
  }

}
