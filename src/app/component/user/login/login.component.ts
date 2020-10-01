import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/service/user/login.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import swal from 'sweetalert';

import { Auth } from '../../../models/auth/auth';
import { AuthService } from '../../../service/auth/auth.service';
import { AuthenticateDocService } from 'src/app/service/dondoctor/authenticate-doc.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {Roles} from '../../../models/Roles';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  login: FormGroup;
  view:string = 'password';
  iconPass:string = 'visibility_off';
  pass: boolean;
  recapchat: boolean = false;
  user: any;

  constructor(private fb: FormBuilder,
              private router: Router,
              private authLogin: AuthService,
              private cookie: CookieService,
              private loginService: LoginService,
              public spinnerService: NgxSpinnerService) { }

  onSubmit() {
    if (!this.login.invalid && this.recapchat) {
      this.spinnerService.show();
      this.loginService.getLogin(this.login.value).subscribe(data => {
        this.spinnerService.hide();
        sessionStorage.setItem('login', btoa(JSON.stringify(data)));
        if (data.givenName === null || data.cn ===  null
          || data.sn === null) {
          swal({
            title: 'Información importante',
            text: 'El usuario no tiene información personal completa, solicite apoyo a soporte.',
            icon: 'info',
          });
        } else {
          let u: Auth = { login: 'true' };
          this.authLogin.setUserLoggetIn(u);
          this.cookie.set('cenAuth', btoa(JSON.stringify(data)));
          switch (data.role) {
            case Roles.CONSULTA: this.router.navigate(['/citas']); break;
            case Roles.RADICAR: this.router.navigate(['/ordenes']); break;
            case Roles.AUTORIZA: this.router.navigate(['/autorizacion']); break;
            default: this.router.navigate(['/citas']);
          }
        }
      }, error => {
        this.spinnerService.hide();
        console.log(error);
        swal({
          title: 'Error',
          text: 'Usuario y Contraseña no coinciden, vuelva a intentarlo',

          icon: 'warning',
        });
      });
    }
  }

  viewPassword() {
    this.pass = !this.pass;
    if(this.pass) {
      this.iconPass = 'visibility';
      this.view = 'text';
    } else {
      this.iconPass = 'visibility_off';
      this.view = 'password';
    }
  }

  resolved(captchaResponse: string) {
    this.recapchat = true;
  }

  ngOnInit() {
    this.login = this.fb.group({
      uid: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      password: ['', [Validators.required]]
    });
  }

}
