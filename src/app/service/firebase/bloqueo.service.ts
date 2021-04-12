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
    var fecha = new Date().getTime();
    return this.db.list('/' + module).push({
      'DateActive': dataLock.DateActive,
      'UserActive': {
        'Documento': dataLock.UserActive.Documento,
        'Nombre': dataLock.UserActive.Nombre, 
        },
        'DateBlocked': fecha
      });
  }

  search(module, idCita){
    return this.db.list('/' + module,  ref => ref.orderByChild('DateActive').equalTo(idCita).limitToLast(1)).valueChanges();
  }
  
  unLock(module): void {
    const jsonFirebase = localStorage.getItem('lock')
    this.db.object('/' + module + '/' + jsonFirebase).remove();
  }

  unLockAll(){
    const listaBloqueos = ['userInfoPrueba/', 'gestionDoc/', 'lockDerivaciones/', 'lockRadicaPrueba/', 'lockAutorizacionPrueba/', 'locktresMenuPrueba/'];
    for(let list of listaBloqueos){
      
      this.unLock(list)
    }
    // this.cookie.delete('lock');
    localStorage.removeItem('lock');
  }

  geyKeyByIdCita(module, idCita){
    return this.db.list('/' + module,  ref => ref.orderByChild('DateActive')
      .equalTo(idCita))
      .snapshotChanges();
  }
  unLockByKey(module, key): void {
    this.db.object('/' + module + '/' + key).remove();
  }
 unlockByKeyPromise = (module, key)=>{
      //return new Promise();
  }

}