import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { TipodocService } from 'src/app/service/catalogos/tipodoc.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from 'ng-animate';
import { CookieService } from 'ngx-cookie-service';
import { UploadFileService } from 'src/app/service/files/upload-file.service';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { GestionContinuidadComponent } from '../gestion-continuidad/gestion-continuidad.component';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { FileSharePoint } from 'src/app/models/SharePoint/FileSharePoint';
import { PacienteSharePoint } from 'src/app/models/SharePoint/PacienteSharePoint';
import { AngularFirestore } from '@angular/fire/firestore';
import { Userlock } from 'src/app/models/firebase/userlock';
import { Bloqueo } from 'src/app/models/firebase/bloqueo';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { EliminaromComponent } from 'src/app/modals/eliminarom/eliminarom.component';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConsultaService } from 'src/app/service/citas/consulta.service';
import { TrazaOrdenComponent } from 'src/app/modals/trazaorden/trazaorden.component';
import { VerDerivacionesComponent } from 'src/app/modals/ver-derivaciones/ver-derivaciones.component';
import { VerRadicarComponent } from 'src/app/modals/ver-radicar/ver-radicar.component';
import { RegistrarautorizacionCitaComponent } from '../registrarautorizacioncita/registrarautorizacioncita.component';
import { CaGestionAutorizacionCita } from 'src/app/models/orden-medica/CaGestionAutorizacionCita';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
@Component({
  selector: 'app-ordenmedica',
  templateUrl: './ordenmedica.component.html',
  styleUrls: ['./ordenmedica.component.less'],
  animations: [
    trigger('fadeIn', [transition('* => *', useAnimation(fadeIn, {
      // Set the duration to 5seconds and delay to 2seconds
      params: { timing: 5, delay: 2 }
    }))])
  ],
})
export class OrdenmedicaComponent implements OnInit {

  filtroOrdenes: FormGroup;
  options: any;
  spinnerCA: boolean;
  verDocs: boolean = false;
  icon: string = 'keyboard_arrow_down';
  validar: boolean = false;
  validarName: boolean = false;
  nameRequired: boolean = false;
  imageSrc: any;
  subir: boolean;
  progress: boolean;
  ordenMedica: any;
  fechaHoy: Date;
  fechaHoy1: string;
  horaHoy: string;
  jsonSize: number;
  fileSharePoint: FileSharePoint = new FileSharePoint();
  @ViewChild('caFile')
  caFile: ElementRef;
  user: any;
  idFire: any;
  fireCA: any;
  @ViewChild('myform') myform: NgForm;
  dataLock: Bloqueo = new Bloqueo();
  metodo: any;
  resultados: any;
  valor: any;
  validateTD: boolean = true;
  ordenesMedicas: Array<any>;

  constructor(private fb: FormBuilder,
    private cookie: CookieService,
    public dialog: MatDialog,
    private consultarordenService: ConsultarordenService,
    private uploadFileService: UploadFileService,
    private spinnerService: NgxSpinnerService,
    private firestore: AngularFirestore,
    private bloqueoService: BloqueoService,
    private tipodocService: TipodocService,
    private ordenService: OrdenService) {
    this.options = tipodocService.getTipoDoc();
    this.user = cookie.get('cenAuth');
    this.user = atob(this.user);
    this.user = JSON.parse(this.user);
  }

  ngOnInit() {
    this.fechaHoy = new Date();
    this.fechaHoy1 = this.fechaHoy.getDate() + '-' + (this.fechaHoy.getMonth() + 1) + '-' + this.fechaHoy.getFullYear();
    this.horaHoy = this.fechaHoy.getHours() + ":" + this.fechaHoy.getMinutes() + 'Hrs.';
    this.filtroOrdenes = this.fb.group({
      tipoDocumento: [''],
      numeroDocumento: ['', [Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      nombre: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/)]],
      primerApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/)]],
      segundoApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/)]]
    });
  }

  onSubmitFile() {
    this.progress = true;
    this.ordenService.crearOrdenMedica(this.filtroOrdenes.value).subscribe(data => {
      this.spinnerService.hide();
      if (data.mensajeError == null) {
        this.ordenMedica = data;
        this.jsonSize = 1;
        this.createFileSharePoint('');
        this.uploadFileService.uploadFiles(this.fileSharePoint).subscribe(data => {
          this.caFile.nativeElement.value = "";
          this.progress = false;
          this.ordenMedica.filename = this.fileSharePoint.nombreArchivo;
          this.bloqueoService.unLock('gestionDoc/');
          swal({
            title: 'Proceso exitoso!',
            text: 'Se actualizó el documento exitosamente',
            icon: 'success',
          }).then(() => {
            this.onSubmit();
          });
        }, error => {
          this.caFile.nativeElement.value = "";
          this.bloqueoService.unLock('gestionDoc/');
          swal({
            title: 'Error',
            text: 'No se pudo cargar el archivo, por favor consulte con soporte',
            icon: 'warning',
          }).then(() => {
            this.onSubmit();
          });
          this.progress = false;
          console.log(error);

        })
      } else {
        swal({
          text: data.mensajeError,
          icon: 'warning',
        });
      }
    }, err => {
      // No se encontró información con los datos ingresados
      // No se pudo consultar la derivación, por favor consulte con soporte
      this.spinnerService.hide();
      swal({
        title: 'Error',
        text: 'No se encontró información con los datos ingresados',
        icon: 'warning',
      });
    });
  }

  handleInputChange(e, ordenMedica, renovar) {
    this.dataLock.UserActive = new Userlock();
    this.dataLock.DateActive = ordenMedica !== undefined && ordenMedica !== null ? ordenMedica.ormIdOrdmNumero : '';
    this.dataLock.UserActive.Documento = this.user.uid;
    this.dataLock.UserActive.Nombre = this.user.cn;
    this.ordenMedica = ordenMedica;

    // this.metodo = this.bloqueoService.search('gestionDoc', this.dataLock.DateActive).subscribe(data => {
    //   this.unSubcribeFirebase()
    //   if(data.length){
    //       this.resultados = data;
    //       swal({
    //         title: 'Derivación bloqueada',
    //         text: `Esta derivación se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
    //         icon: 'info',
    //       });
    //   } else {
    // this.valor = this.bloqueoService.lock(this.dataLock, 'gestionDoc');
    // console.log(this.valor);
    // localStorage.setItem('lock', this.valor.key);
    this.bloqueoService.lock(this.dataLock, 'gestionDoc');
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    const reader = new FileReader();
    if (renovar === 'renovar') {
      reader.onload = this._handleReaderLoadedRenovar.bind(this);
    } else {
      reader.onload = this._handleReaderLoaded.bind(this);
    }
    reader.readAsDataURL(file);
    this.fileSharePoint.nombreArchivo = file.name;
    // }
    // });
  }

  unSubcribeFirebase() {
    this.metodo.unsubscribe();
  }

  _handleReaderLoaded(e) {
    this.subir = true;
    const reader = e.target;
    this.imageSrc = reader.result;
    this.fileSharePoint.archivo = this.imageSrc.split(',')[1]
    this.subir = true;
    this.onSubmitFile();
    this.bloqueoService.unLock('gestionDoc/');
    // this.cookie.delete('gestionDoc');
    return this.imageSrc;
  }

  _handleReaderLoadedRenovar(e) {
    this.subir = true;
    const reader = e.target;
    this.imageSrc = reader.result;
    this.fileSharePoint.archivo = this.imageSrc.split(',')[1]
    this.subir = true;
    this.createFileSharePoint('');
    this.progress = true;
    this.uploadFileService.uploadFiles(this.fileSharePoint).subscribe(data => {
      this.caFile.nativeElement.value = "";
      this.progress = false;
      this.ordenMedica.filename = this.fileSharePoint.nombreArchivo;
      swal({
        title: 'Proceso exitoso!',
        text: 'Se actualizó el documento exitosamente',
        icon: 'success',
      })
    }, error => {
      this.caFile.nativeElement.value = "";
      swal({
        title: 'Error',
        text: 'No se pudo cargar el archivo, por favor consulte con soporte',
        icon: 'warning',
      })
      this.progress = false;
      console.log(error);

    })
    this.bloqueoService.unLock('gestionDoc/');
    // this.cookie.delete('gestionDoc');
    return this.imageSrc;
  }

  cambiar() {
    this.spinnerCA = !this.spinnerCA;
  }

  clear() {
    this.ordenMedica = '';
    this.ordenesMedicas = null;
    this.filtroOrdenes.reset();
    this.myform.resetForm();
    this.validar = true;
    this.validarName = false;
    this.nameRequired = false;
  }

  private registerForm(fData: any, formDirective: FormGroupDirective): void {
    formDirective.resetForm();
    this.filtroOrdenes.reset();
  }

  viewFiles() {
    this.verDocs = !this.verDocs;
    if (this.verDocs) {
      this.icon = 'keyboard_arrow_up';
    } else {
      this.icon = 'keyboard_arrow_down';
    }
  }

  validateNumber() {
    if (this.filtroOrdenes.value.tipoDocumento === 'MENOR SIN IDENTIFICACION' ||
      this.filtroOrdenes.value.tipoDocumento === 'ADULTO SIN IDENTIFICACION') {
      this.validar = false;
    } else {
      this.validar = true;
    }
  }

  validateTipoDoc() {
    this.validateTD = true;
  }

  onSubmit() {
    if (!this.filtroOrdenes.invalid) {
      this.spinnerService.show();
      this.consultarordenService.filterOrden(this.filtroOrdenes.value).subscribe(data => {
        this.spinnerService.hide();
        if (data.length > 0) {
          this.ordenesMedicas = data;
          this.jsonSize = 1;
        } else {
          this.spinnerService.hide();
          swal({
            title: 'Error',
            text: 'No se encontró información con los datos ingresados',
            icon: 'warning',
          });
        }
      }, err => {
        // No se encontró información con los datos ingresados
        // No se pudo consultar la derivación, por favor consulte con soporte
        this.spinnerService.hide();
        this.ordenesMedicas = null;
        swal({
          title: 'Error',
          text: 'No se encontró información con los datos ingresados',
          icon: 'warning',
        });
      });
    }
  }

  validateName(event) {
    this.nameRequired = true;
  }

  openDialogGestion(): void {
    const dialogRef = this.dialog.open(GestionContinuidadComponent, {
      data: {
        myVar: 'Hola Leslye'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  saveOrden() {
    localStorage.setItem('orden', JSON.stringify(this.ordenMedica.ormIdOrdmNumero));
  }

  getState(state: number) {
    switch (state) {
      case 1: return 'PRE-RADICADA';
      case 2: return 'REGISTRADA';
      case 3: return 'RADICADA';
      case 4: return 'AUTORIZADA';
      case 5: return 'AGENDADA';
      case 6: return 'ELIMINADA';
      default: return '';
    }
  }

  createFileSharePoint(ordenMedica) {
    let orden = ordenMedica ? ordenMedica : this.ordenMedica;
    this.fileSharePoint.pac = new PacienteSharePoint();
    this.fileSharePoint.pac.tipoDocId = orden.tipTipIDav;
    this.fileSharePoint.pac.numDocId = orden.documento;
    this.fileSharePoint.archivoGral = false;
    this.fileSharePoint.ormIdOrdmNumero = orden.ormIdOrdmNumero;
    if (this.fileSharePoint.nombreArchivo === undefined) {
      this.fileSharePoint.nombreArchivo = "OM-" + this.fileSharePoint.pac.numDocId + "-" + this.fileSharePoint.ormIdOrdmNumero + "." +
        orden.filename.split('.').pop();
    } else {
      this.fileSharePoint.nombreArchivo = "OM-" + this.fileSharePoint.pac.numDocId + "-" + this.fileSharePoint.ormIdOrdmNumero + "." +
        this.fileSharePoint.nombreArchivo.split('.').pop();
    }
    this.fileSharePoint.fecha = orden.fechaRegistroFile;
  }

  download(ordenMedica) {
    this.createFileSharePoint(ordenMedica);
    this.spinnerService.show();
    this.uploadFileService.downloadFile(this.fileSharePoint).subscribe(
      data => {
        this.spinnerService.hide();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(data);
        a.download = this.fileSharePoint.nombreArchivo;
        a.target = '_self';
        document.body.appendChild(a);
        a.click();
      }, error => {
        this.spinnerService.hide();
        swal({
          title: 'Error',
          text: 'No se pudo consultar descargar el archivo, por favor intentelo nuevamente',
          icon: 'warning',
        });
        console.log(error);
      }
    );
  }

  delete(ordenMedica) {
    let orden = ordenMedica ? ordenMedica : this.ordenMedica;
    this.createFileSharePoint(ordenMedica);
    const dialogRef = this.dialog.open(EliminaromComponent, {
      height: '250px',
      data: {
            ormId: orden.ormIdOrdmNumero,
            userUid : this.user.uid,
            sharepoint:this.fileSharePoint
      },
  });
  dialogRef.afterClosed().subscribe(result => {
    this.onSubmit();
  });
  }


  validateTypeDocument() {
    const value = this.filtroOrdenes.get('tipoDocumento').value;
    if (value === 'M' || value === 'A') {
      this.validarName = true;
      this.nameRequired = true
      this.validar = false;
    } else {
      this.validarName = false;
      this.validar = true;
      this.nameRequired = false;
    }
  }

}


// *ngIf="dataSourceRadicadas?.prestaciones !== dataSourceRadicadas?.continuidad && dataSourceRadicadas?.prestaciones && dataSourceRadicadas?.continuidad "
