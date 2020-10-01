import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GestionContinuidad } from 'src/app/models/gestion-continuidad/GestionContinuidad';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionContinuidadService {

  constructor(private http: HttpClient) {}

  createGestionContinuidad(gestionContinuidad: GestionContinuidad): Observable<Object> {
    return this.http.post<GestionContinuidad>( environment.url + '/CentralAutoriza/rest/ordenesMedicas/gestionContinuidad', gestionContinuidad);
  }

}
