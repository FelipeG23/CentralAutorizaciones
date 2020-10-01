import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class BloqueoService {
  user: string;
  idFire: any;
  fireCA: any;
  result: any = {
    key: ''
  };
  prueba: any;
  task: any;
  taskEnd: void;

  constructor(private firestore: AngularFirestore,
              private db: AngularFireDatabase,
              private cookie: CookieService) {
    // this.user = cookie.get('cenAuth');
    // this.user = JSON.parse(atob(this.user));
  }

  lock(dataLock, module) {
    return this.db.list('/' + module).push({'DateActive': dataLock.DateActive,
      'UserActive': {
        'Documento': dataLock.UserActive.Documento,
        'Nombre': dataLock.UserActive.Nombre
        }
      });
  }

  search(module, idCita){
    return this.db.list('/' + module,  ref => ref.orderByChild('DateActive').equalTo(idCita)).valueChanges();
  }
  
  unLock(module): void {
    const jsonFirebase = localStorage.getItem('lock')
    this.db.object('/' + module + '/' + jsonFirebase).remove();
  }

  unLockAll(){
    const listaBloqueos = ['userInfo/', 'gestionDoc/', 'lockDerivaciones/', 'lockRadica/', 'lockAutorizacion/', 'locktresMenu/'];
    for(let list of listaBloqueos){
      
      this.unLock(list)
    }
    // this.cookie.delete('lock');
    localStorage.removeItem('lock');
  }

}
