import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import swal from 'sweetalert';


@Injectable({
  providedIn: 'root'
})

export class NgRecaptcha3Service {

  private baseUrl = 'https://www.google.com/recaptcha/api.js';
  private siteKey = '6LemONkZAAAAADm7ziErk-kxOp31Zw_3CuwofeCm';
  private secretKey = '6LemONkZAAAAAGOlQdUDGj9NZ89KoRbQRT4y8-tP';
  private isLoaded: Boolean = false;
  private scriptId;

  
  constructor(private http: HttpClient) {
    window['ngRecaptcha3Loaded'] = () => {
      this.isLoaded = true;
    };
    this.scriptId = +(new Date());
   }

   public getToken(action?: any): Promise<any> {
     try {
      return window['grecaptcha'].execute(this.siteKey, action);
     } catch (error) {
      swal({
        title: 'Error Captcha',
        text:  'Comuniquese con el administrador',
        icon: 'warning',
      });     }
  }

  public init(siteKey) {
    
    return new Promise((resolve, reject) => {
      if (this.isLoaded) {
        resolve('success');
        return;
      } else {
        this.siteKey = siteKey;
        const script = document.createElement('script');
        script.innerHTML = '';
        script.src = this.baseUrl + `?render=${this.siteKey}&onload=ngRecaptcha3Loaded`;
        script.id = `recapthcha-${this.scriptId}`;
        script.async = true;
        script.defer = true;
        script.onload = (data) => {
          resolve('success');
        }
        script.onerror = () => {
          reject('error');
        };
        document.head.appendChild(script);
      }

    });

  }

  public destroy() {
	this.isLoaded = false;
    const script = document.getElementById(`recapthcha-${this.scriptId}`);
    if (script) {
      script.remove();
    }
    const badge = document.getElementsByClassName('grecaptcha-badge')[0];
    if (badge) {
      badge.remove();
    }

  }

   verifiCaptcha(datos) {
    return this.http.get(`https://www.google.com/recaptcha/api/siteverify?secret=${this.secretKey}&response=${datos}`);
  } 

   
}
