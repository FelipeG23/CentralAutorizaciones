import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CACHE_KEY = 'httpTipoDocCache';

@Injectable({
  providedIn: 'root'
})
export class TipodocService {

  tipoDoc: any;

  constructor(private http: HttpClient) {}

  getTipoDoc() {
    this.tipoDoc = this.http.get<any>( environment.url + '/CentralAutoriza/rest/Catalogo/TipDoc')
      .pipe(
        map(data => data)
      );
    this.tipoDoc.subscribe(next => {
      localStorage[CACHE_KEY] = JSON.stringify(next);
    });
    this.tipoDoc = this.tipoDoc.pipe(
      startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
    );
    return this.tipoDoc;
  }
}
