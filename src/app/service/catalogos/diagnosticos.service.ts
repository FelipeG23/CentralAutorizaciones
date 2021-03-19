import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { AuthenticateDocService } from '../dondoctor/authenticate-doc.service';
import { Observable } from 'rxjs';

const CACHE_KEY = 'httpConvenioCache';

@Injectable({
    providedIn: 'root'
})
export class DiagnostivosService {
    params: any;


    constructor(private http: HttpClient) {
    }

    diagnosticos(): Observable<any> {
        return this.http.get(environment.url + '/CentralAutorizav2/rest/Catalogo/diagnosticos');
    }

    diagnosticosLike(busqueda) {
        this.params = {
            cn: busqueda.toUpperCase()
        };
        return this.http.post<any>(environment.url + '/CentralAutorizav2/rest/Catalogo/diagnosticosLike', this.params);
    }


}

