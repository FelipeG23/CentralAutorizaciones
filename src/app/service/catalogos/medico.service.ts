import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CACHE_KEY = 'httpMedicoCache';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  constructor(private http: HttpClient) {}

  getMedicos() {
    return this.http.get<any>( environment.api + '/listas/medicos');
  }
}
