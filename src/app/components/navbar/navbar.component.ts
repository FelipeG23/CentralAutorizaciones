import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Roles } from '../../models/Roles';
import { AngularFirestore } from '@angular/fire/firestore';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {
  user: any;
  rol: string;
  roleConsulta: string = Roles.CONSULTA;
  rolRadicar: string = Roles.RADICAR;
  rolAautorizar: string = Roles.AUTORIZA;
  rolDerivaciones: string = Roles.AUTORIZA;
  rolImagenes: string = Roles.AUTORIZA;
  rolAdmin: string = Roles.ADMIN;
  activate: boolean;

  constructor(private cookie: CookieService,
              private firestore: AngularFirestore,
              private bloqueoService: BloqueoService,
              private router: Router) {
                this.user = cookie.get('cenAuth');
                this.user = atob(this.user);
                this.user = JSON.parse(this.user);

                console.log(this.router.url)

  }

  ngOnInit() {
      switch (this.user.role) {
          case Roles.AUTORIZA: this.rol = 'Autoriza'; break;
          case Roles.CONSULTA: this.rol = 'Consulta'; break;
          case Roles.RADICAR: this.rol = 'Radicar'; break;
      }
      this.activate = this.router.url !== '/radicar' ? false : true;
  }

  deleteFirebase() {
    this.bloqueoService.unLockAll();
  }

  logout() {
    this.bloqueoService.unLockAll();
    clearInterval(parseInt(this.cookie.get('Intervalo')));
    clearInterval(parseInt(this.cookie.get('intervalTimeOut')));
    this.cookie.deleteAll();
    sessionStorage.removeItem('login');
    this.router.navigate(['/']);
  }

}
