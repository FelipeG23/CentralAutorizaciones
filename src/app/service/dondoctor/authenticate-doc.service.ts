import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateDocService {
  uri: string = 'https://motorconvenios.co/api/';
  params: any;
  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAuthenticatedDonDoctor() {
    this.params = {
      'Username': 'motorconvenios',
      'Password': 'C0nveni0s_2019@'
      };
    return this.http.post<any>( this.uri + 'authenticate', this.params, { headers: this.headers });
  }
}
