import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedService {
  userLogget: any;

  constructor(private cookie: CookieService) { }

  getUser() {
    this.userLogget = JSON.parse(atob(this.cookie.get('cenAuth')));
    return this.userLogget;
  }

}
