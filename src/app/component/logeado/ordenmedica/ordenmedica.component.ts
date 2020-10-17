import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormControl } from '@angular/forms';
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

  // Derivaciones

  filtroOrdenesDerivaciones: FormGroup;
  //options: any;
  spinnerCADerivaciones: boolean;
  //icon: string = 'keyboard_arrow_down';
  // validar: boolean = false;
  //nameRequired: boolean = false;       //
  // imageSrc: any;
  //subir: boolean;
  success: boolean = false;
  result: any;
  //progress: boolean;
  ordenesMedicasDerivaciones: any[];
  ordenesMedicasRadicadas: any[];
  citasPorAutorizar: any[];
  date = new Date();
  minDateValue = new Date(this.date.getFullYear(), 1, 1);
  maxDateValue = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
  minDate = new Date(this.date.getFullYear(), 0, 1);
  maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  maxDateFin = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
  displayedColumns: string[] = ['cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'radicar'];
  displayedColumnsCitas: string[] = ['cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'enProceso', 'autorizar'];
  dataSource = new MatTableDataSource(this.ordenesMedicasDerivaciones);
  @ViewChild('paginatorCitas', { read: MatPaginator }) paginatorCitas: MatPaginator;
  @ViewChild('paginatorPorRadicadar', { read: MatPaginator }) paginatorPorRadicadar: MatPaginator;
  @ViewChild('paginatorRadicadas', { read: MatPaginator }) paginatorRadicadas: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumnsRadicadas: string[] = ['estado', 'ormIdOrdmNumero', 'cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'cita', 'enProceso', 'continuidad', 'autorizacion'];
  dataSourceRadicadas = new MatTableDataSource(this.ordenesMedicasRadicadas);
  //@ViewChild('sortRadicadas', {read: MatSort}) sortRadicadas: MatSort;
  dataSourceCitas = new MatTableDataSource(this.citasPorAutorizar);
  bloqueo: any;
  // idFire: any;
  //fireCA: any;
  // user: any;             //
  // response: any;
  // dataLock: Bloqueo = new Bloqueo();   //
  // metodo: any;
  // resultados: any;
  // valor: any;
  //validarName: boolean = false;



  constructor(
    private fb: FormBuilder,
        public dialog: MatDialog,
        private consultaService: ConsultaService,
        private consultarordenService: ConsultarordenService,
        private firestore: AngularFirestore,
        private cookie: CookieService,
        private router: Router,
        private spinnerService: NgxSpinnerService,
        private tipodocService: TipodocService,
        private renderer: Renderer2,
        private bloqueoService: BloqueoService,
    private uploadFileService: UploadFileService,
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

    moment.locale('es');
    moment.relativeTimeThreshold('m', 60);
    moment.relativeTimeThreshold('h', 24 * 26);
    this.initFilter();
    this.dataSource.sort = this.sort;
    this.dataSourceCitas.paginator = this.paginatorCitas;
    this.dataSource.paginator = this.paginatorPorRadicadar;
    this.dataSourceRadicadas.paginator = this.paginatorRadicadas;
    this.callSubmits();


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
        userUid: this.user.uid,
        sharepoint: this.fileSharePoint
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

  //  Derivaciones

  initFilter() {

    this.filtroOrdenesDerivaciones = this.fb.group({
      fecha: [{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]],
      fechaFinal: [{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]],
      numeroDerivacion: [null,
        [Validators.minLength(1), Validators.maxLength(10),
        Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[0-9\s]+$/)]],
      fechaAbordaje: [{ disabled: true, value: null }],
      estadoAutorizacion: [null],
      tipoDocumento: [null],
      numeroDocumento: [null, [Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      nombre: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]],
      primerApellido: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]],
      segundoApellido: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]]
    });
  }

  callSubmits() {
    this.ordenesMedicasDerivaciones = null;
    this.ordenesMedicasRadicadas = null;
    this.citasPorAutorizar = null;
    this.onSubmitCitas();
    this.onSubmitPorRadicar([1, 2]);
    this.onSubmitDerivaciones([3]);
    this.filtroOrdenesDerivaciones.removeControl('fecha');
    this.filtroOrdenesDerivaciones.removeControl('fechaFinal');
    this.filtroOrdenesDerivaciones.setControl('fecha', new FormControl([{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]]));
    this.filtroOrdenesDerivaciones.setControl('fechaFinal', new FormControl([{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]]));
  }


  onSubmitCitas(isList?) {
    const months = this.filtroOrdenesDerivaciones.get("fechaFinal").value
      .diff(this.filtroOrdenesDerivaciones.get("fecha").value, 'months');
    // if (months > 1) {
    //     swal({
    //         title: 'Error',
    //         text: 'El filtro de fechas supera al de un mes',
    //         icon: 'warning',
    //     });
    //     return;
    // }
    if (!this.filtroOrdenesDerivaciones.invalid) {
      this.spinnerService.show();
      this.consultaService.getCitasPorAutorizar(this.filtroOrdenesDerivaciones.getRawValue()).subscribe(data => {
        this.spinnerService.hide();
        this.citasPorAutorizar = data;
        this.dataSourceCitas.data = this.citasPorAutorizar;

      }, err => {
        this.citasPorAutorizar = [];
        swal({
          title: 'Error',
          text: 'No se pudo consultar las citas, por favor consulte con soporte',
          icon: 'warning',
        });
        console.log(err);
      });
    }
  }


  onSubmitPorRadicar(estados, isList?) {
    const months = this.filtroOrdenesDerivaciones.get("fechaFinal").value
        .diff(this.filtroOrdenesDerivaciones.get("fecha").value, 'months');
    // if (months > 1) {
    //     swal({
    //         title: 'Error',
    //         text: 'El filtro de fechas supera al de un mes',
    //         icon: 'warning',
    //     });
    //     return;
    // }
    // this.filtroOrdenes.patchValue({ 'fechaFinal': this.filtroOrdenes.get("fechaFinal").value.add(1, 'days') });
    if (!this.filtroOrdenesDerivaciones.invalid) {
        this.consultarordenService.filterOrdenes(this.filtroOrdenesDerivaciones.getRawValue(), estados).subscribe(data => {
            if (data.mensajeError == null) {
                this.ordenesMedicasDerivaciones = data;
                this.ordenesMedicasDerivaciones = this.ordenesMedicasDerivaciones.reverse();
                this.dataSource.data = this.ordenesMedicasDerivaciones;
           
            } else {
                swal({
                    text: data.mensajeError,
                    icon: 'warning',
                });
            }
        }, err => {
            this.ordenesMedicasDerivaciones = [];
            swal({
                title: 'Error',
                text: 'No se pudo consultar la derivación, por favor consulte con soporte',
                icon: 'warning',
            });
            console.log(err);
            this.onSubmitDerivaciones([2, 3, 4]);
        });
    }
}


onSubmitDerivaciones(estados, isList?) {
  const months = this.filtroOrdenesDerivaciones.get("fechaFinal").value
      .diff(this.filtroOrdenesDerivaciones.get("fecha").value, 'months');
  // if (months > 1) {
  //     swal({
  //         title: 'Error',
  //         text: 'El filtro de fechas supera al de un mes',
  //         icon: 'warning',
  //     });
  //     return;
  // }
  if (!this.filtroOrdenesDerivaciones.invalid) {
      this.consultarordenService.filterOrdenes(this.filtroOrdenesDerivaciones.getRawValue(), estados).subscribe(data => {
          if (data.mensajeError == null) {
              this.ordenesMedicasRadicadas = data;
              this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data => {
                  if(data.prestaciones !== data.continuidad || data.continuidad === null || data.prestaciones === null  ){
                      if(data.prestaciones !== data.autorizadas + data.continuidad) {
                          return data
                      }
                  }
              })
              this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.reverse();

              this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;
          } else {
              swal({
                  text: data.mensajeError,
                  icon: 'warning',
              });
          }
      }, err => {
          this.ordenesMedicasRadicadas = [];
          swal({
              title: 'Error',
              text: 'No se pudo consultar la derivación, por favor consulte con soporte',
              icon: 'warning',
          });
          console.log(err);
      });
  }
}


validateNameDerivaciones(event) {
  this.nameRequired = true;
}

openDialogTraza(datoTraza): void {
  this.dialog.open(TrazaOrdenComponent, {
      height: '500px',
      data: datoTraza
  });
}

openDialogAuto(datoTraza): void {
  localStorage.setItem('ordenId', datoTraza.ormIdOrdmNumero);
  this.spinnerService.show();
  this.consultarordenService.validarGestionContinuidad(datoTraza.ormIdOrdmNumero).subscribe((continuidad: boolean) => {
      if (!continuidad) {
          swal({
              title: 'Información',
              text: 'Para realizar la Autorización, por favor realice la gestión de continuidad, para la orden ' + datoTraza.ormIdOrdmNumero,
              icon: 'info',
          });
          this.spinnerService.hide();
          return;
      }
      this.ordenService.getDetailOrden(datoTraza.ormIdOrdmNumero).subscribe(v => {
          this.spinnerService.hide();
          let caPrestacionesOrdMed: Array<CaPrestacionesOrdMed> = v.caPrestacionesOrdMed;
          if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
              caPrestacionesOrdMed.length > 0) {
              caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caPrestacion: CaPrestacionesOrdMed) => {
                  return caPrestacion.caGestionAutorizacion === null ||
                      caPrestacion.caGestionAutorizacion.gauAutorizaServ === '3'
              });
              if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
                  caPrestacionesOrdMed.length > 0) {
                  const dialogRef = this.dialog.open(VerDerivacionesComponent, {
                      height: '500px',
                      data: datoTraza,
                      disableClose: true
                  });
                  dialogRef.afterClosed().subscribe((data) => {
                      // consultamos nuevamente las derivaciones radicadas
                      this.ordenesMedicasRadicadas = null;
                      this.initFilter();
                      this.onSubmitDerivaciones([2, 3]);
                  });
              }
          }
      }, () => {
          this.spinnerService.hide();
      })
  }, () => {
      this.spinnerService.hide();
  })
}


openDialogView(element) {
  if (localStorage.getItem('lock')) {
      this.bloqueoService.unLockAll()
  }
  this.metodo = this.bloqueoService.search('locktresMenu', element.ormIdOrdmNumeroP).subscribe(data => {
      this.unSubcribeFirebase()
      console.log(data.length)
      if (data.length) {
          this.resultados = data;
          swal({
              title: 'La autorización bloqueada',
              text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
              icon: 'info',
          });
      } else {
          this.dataLock.UserActive = new Userlock();
          this.dataLock.DateActive = element !== undefined && element !== null ? element.ormIdOrdmNumeroP : '';
          this.dataLock.UserActive.Documento = this.user.uid;
          this.dataLock.UserActive.Nombre = this.user.cn;
          this.valor = this.bloqueoService.lock(this.dataLock, 'locktresMenu');
          localStorage.setItem('lock', this.valor.key);
          localStorage.setItem('orden', JSON.stringify(element.ormIdOrdmNumero));
          const dialogRef = this.dialog.open(VerRadicarComponent, {
              height: '500px',
              data: element
          });
          dialogRef.afterClosed().subscribe((data) => {
              this.bloqueoService.unLockAll();
              this.initFilter();
              this.onSubmitDerivaciones([2, 3]);
          });
          // this.bloqueoService.unLock('lockDerivaciones/');
      }
  });
}

getTime(date) {
  return 'Creadó ' + moment(date).fromNow();
}

getNumberHours(date) {
  if (moment(date).fromNow().includes('segundos')) {
      return 0;
  } else if (moment(date).fromNow().includes('minuto')) {
      return 0;
  } else if (moment(date).fromNow().includes('una')) {
      return 1;
  } else if (moment(date).fromNow().includes('mes')) {
      return 100;
  } else {
      return moment(date).fromNow().split(' ')[1];
  }
}

radicar(element) {
  this.dataLock.UserActive = new Userlock();
  this.dataLock.DateActive = element.ormIdOrdmNumero;
  this.dataLock.UserActive.Documento = this.user.uid;
  this.dataLock.UserActive.Nombre = this.user.cn;
  if (localStorage.getItem('lock')) {
      this.bloqueoService.unLockAll()
  }
  this.metodo = this.bloqueoService.search('lockRadica', this.dataLock.DateActive).subscribe(data => {
      this.unSubcribeFirebase()
      if (data.length) {
          this.resultados = data;
          swal({
              title: 'Autorización bloqueada',
              text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
              icon: 'info',
          });
      } else {
          this.valor = this.bloqueoService.lock(this.dataLock, 'lockRadica');
          localStorage.setItem('lock', this.valor.key);
          localStorage.setItem('orden', JSON.stringify(element.ormIdOrdmNumero));
          this.router.navigate(['/radicar']);
      }
  })
}

openDialogAutorizacion(datoCita, modulo) {
  this.dataLock.UserActive = new Userlock();
  this.dataLock.DateActive = datoCita.idCita;
  this.dataLock.UserActive.Documento = this.user.uid;
  this.dataLock.UserActive.Nombre = this.user.cn;
  if (localStorage.getItem('lock')) {
      this.bloqueoService.unLockAll()
  }
  this.metodo = this.bloqueoService.search('lockAutorizacion', this.dataLock.DateActive).subscribe(data => {
      this.unSubcribeFirebase()
      if (data.length) {
          this.resultados = data;
          swal({
              title: 'Autorización bloqueada',
              text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
              icon: 'info',
          });
      } else {
          this.valor = this.bloqueoService.lock(this.dataLock, 'lockAutorizacion');
          localStorage.setItem('lock', this.valor.key);
          const dialogRef = this.dialog.open(RegistrarautorizacionCitaComponent, {
              data: { datoCita },
              height: '500px',
              disableClose: true
          });
          dialogRef.afterClosed().subscribe((caGestionAutorizacionCita: CaGestionAutorizacionCita) => {
              if (caGestionAutorizacionCita != null) {
                  this.citasPorAutorizar = null;
                  // this.onSubmitCitas();
                  this.bloqueoService.unLock('lockAutorizacion/');
              }
              if (caGestionAutorizacionCita === undefined) {
                  this.bloqueoService.unLock('lockAutorizacion/');
              }
              this.initFilter();
              this.onSubmitCitas();
          });
      }
  });
}




}


// *ngIf="dataSourceRadicadas?.prestaciones !== dataSourceRadicadas?.continuidad && dataSourceRadicadas?.prestaciones && dataSourceRadicadas?.continuidad "
