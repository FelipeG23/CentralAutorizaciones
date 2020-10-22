import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '../../models/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isUserLoggedIn: boolean;
  usserLogged: Auth;
  userLogget: string;

  constructor(private http: HttpClient) {
    this.isUserLoggedIn = false;
  }

  setUserLoggetIn(user: Auth) {
    this.isUserLoggedIn = true;
    this.usserLogged = user;
    sessionStorage.setItem('login', btoa(this.usserLogged.login));
  }

  getUserLoggedIn() {
    this.userLogget = sessionStorage.getItem('login');
    return atob(this.userLogget);
  }


  recapcha() {
    return this.http.post('https://www.google.com/recaptcha/api.js?render=6LemONkZAAAAADm7ziErk-kxOp31Zw_3CuwofeCm', {action: 'submit'});

  }





}
