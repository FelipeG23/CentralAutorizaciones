import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SedesService {

  constructor(private http: HttpClient) {}

  getSedes() {
    return this.http.get<any>( environment.api + '/listas/sedes');
  }
}
