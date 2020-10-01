import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BloqueoService } from './service/firebase/bloqueo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'centralautorizacionesFSFB';

  constructor(private cookie: CookieService, private bloqueoService: BloqueoService){
    this.bloqueoService.unLockAll();
  }
}
