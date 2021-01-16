import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  params: { 'uid': any; 'password': any; };

  constructor(private http: HttpClient) {}

  getLogin(userData) {
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/Service/ingresar', userData);
  }
}
