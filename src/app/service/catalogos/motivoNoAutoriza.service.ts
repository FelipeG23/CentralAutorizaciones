import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivoNoAutorizaService {

  constructor(private http: HttpClient) {}

  getMotivoNoAutoriza() {
    return this.http.get<any>( environment.api + '/listas/motivoNoAutoriza');
  }
}