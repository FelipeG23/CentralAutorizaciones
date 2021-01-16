import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CACHE_KEY = 'httpPrestacionCache';

@Injectable({
  providedIn: 'root'
})
export class PresentacionService {
  
  prestaciones: any;

  constructor(private http: HttpClient) {}

  getPresentaciones() {
    this.prestaciones = this.http.get<any>( environment.url + '/CentralAutorizav2/rest/Catalogo/Prestacion')
      .pipe(
        map(data => data)
      );
    this.prestaciones.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.prestaciones = this.prestaciones.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.prestaciones;
  }
}
