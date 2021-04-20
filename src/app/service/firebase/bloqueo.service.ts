import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { environment } from 'src/environments/environment';

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
  cTime: number;
  timeBlocked: number;

  constructor(private firestore: AngularFirestore,
              private db: AngularFireDatabase,
              private cookie: CookieService,
              private http: HttpClient) {
    // this.user = cookie.get('cenAuth');
    // this.user = JSON.parse(atob(this.user));
  }

  lock(dataLock, module) {
    if(this.timeBlocked == undefined){
      this.timeBlocked = (new Date).getTime();
    }
    return this.db.list('/' + module).push({
      'DateActive': dataLock.DateActive,
      'UserActive': {
        'Documento': dataLock.UserActive.Documento,
        'Nombre': dataLock.UserActive.Nombre, 
        },
        'DateBlocked': this.timeBlocked
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
  obtenerCitasBloqueadas(module){
    return this.db.list<any>('/' + module,  ref => ref.orderByChild('DateBloqued')).valueChanges();
  }

  getCurrentTime() {
    return this.http.get<any>( environment.api + '/utils/getTime');
  }

  compareCurrentAndBlockedTime(){
    this.getCurrentTime().subscribe(time => {
      console.log(time.time);
      this.cTime = time.time;
      return this.cTime - 1618605227916;
    })
  }
  setTimeBlocked(time:number){
    this.timeBlocked = time;
  }

}