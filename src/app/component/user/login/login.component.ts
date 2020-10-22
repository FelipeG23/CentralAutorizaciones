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
import { Roles } from '../../../models/Roles';
import { NgRecaptcha3Service } from 'src/app/service/ng-recaptcha3.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  login: FormGroup;
  view: string = 'password';
  iconPass: string = 'visibility_off';
  pass: boolean;
  recapchat: boolean = false;
  user: any;
  private siteKey = '6LemONkZAAAAADm7ziErk-kxOp31Zw_3CuwofeCm';
  formData: any;


  constructor(private fb: FormBuilder,
    private router: Router,
    private authLogin: AuthService,
    private cookie: CookieService,
    private loginService: LoginService,
    public spinnerService: NgxSpinnerService,
    private recaptcha3: NgRecaptcha3Service
  ) { }

  ngOnInit() {

    this.recaptcha3.init(this.siteKey).then(status => {
      // status: success/error
      // success - script is loaded and greaptcha is ready
      // error - script is not loaded
      console.log("Diego", status);
    })

    this.login = this.fb.group({
      uid: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      password: ['', [Validators.required]],
      //  recapchat: ['', [Validators.required]],
    });

  }

  onSubmit() {

    this.recaptcha3.init(this.siteKey);


    if (!this.login.invalid) {
      this.spinnerService.show();
      this.loginService.getLogin(this.login.value).subscribe(data => {
        this.spinnerService.hide();
        sessionStorage.setItem('login', btoa(JSON.stringify(data)));
        if (data.givenName === null || data.cn === null
          || data.sn === null) {
          swal({
            title: 'Información importante',
            text: 'El usuario no tiene información personal completa, solicite apoyo a soporte.',
            icon: 'info',
          });
        } else {
            this.recaptcha3.getToken().then(token => {
              this.formData = this.login.value;
              this.formData.recaptchaToken = token;
              // console.log("datos", this.formData);

              this.recaptcha3.verifiCaptcha(token)
              .subscribe(data => {
                // console.log(data);

              });

              let u: Auth = { login: 'true' };
              this.authLogin.setUserLoggetIn(u);
              this.cookie.set('cenAuth', btoa(JSON.stringify(data)));
              switch (data.role) {
                case Roles.CONSULTA: this.router.navigate(['/citas']); break;
                case Roles.RADICAR: this.router.navigate(['/ordenes']); break;
                case Roles.AUTORIZA: this.router.navigate(['/autorizacion']); break;
                default: this.router.navigate(['/citas']);
              }

            }).catch( error => {
              console.error( 'función enRechazo invocada: ', error );
            })
            
        }
      }, error => {
        this.spinnerService.hide();
        console.log(error);
        swal({
          title: 'Error',
          text:  'Usuario y Contraseña no coinciden, vuelva a intentarlo',

          icon: 'warning',
        });
      });
    }
  }

  viewPassword() {
    this.pass = !this.pass;
    if (this.pass) {
      this.iconPass = 'visibility';
      this.view = 'text';
    } else {
      this.iconPass = 'visibility_off';
      this.view = 'password';
    }
  }

  /*
  resolved(captchaResponse: string) {
    this.recapchat = true;
  } */





}
