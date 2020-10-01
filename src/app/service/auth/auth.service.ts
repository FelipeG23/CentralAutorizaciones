import { Injectable } from '@angular/core';
import { Auth } from '../../models/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isUserLoggedIn: boolean;
  usserLogged: Auth;
  userLogget: string;

  constructor() {
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
}
