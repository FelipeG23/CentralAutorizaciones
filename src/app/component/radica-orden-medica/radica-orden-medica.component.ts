import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { EspecialidadService } from 'src/app/service/catalogos/especialidades.service';
import { SedesService } from 'src/app/service/catalogos/sedes.service';
import { ConvenioService } from 'src/app/service/catalogos/convenio.service';
import { CieService } from 'src/app/service/catalogos/cie.service';
import { ClasificacionService } from 'src/app/service/catalogos/clasificacion.service';
import swal from 'sweetalert';
import { Router } from '@angular/router';
import { ServiciosService } from 'src/app/service/catalogos/servicios.service';
import { MedicoService } from 'src/app/service/catalogos/medico.service';
import { AdminOrdenMedica } from 'src/app/models/orden-medica/AdminOrdenMedica';
import { DetalleOrdenMedica } from 'src/app/models/orden-medica/DetalleOrdenMedica';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { FileSharePoint } from 'src/app/models/SharePoint/FileSharePoint';
import { UploadFileService } from 'src/app/service/files/upload-file.service';
import { PacienteSharePoint } from 'src/app/models/SharePoint/PacienteSharePoint';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { SelectPrestacionComponent } from 'src/app/modals/select-prestacion/select-prestacion.component';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { OrdenMedica } from 'src/app/models/orden-medica/OrdenMedica';
import { CrearPrestacionesOrdMed } from 'src/app/models/orden-medica/CrearPrestacionesOrdMed';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GestionContinuidadComponent } from '../logeado/gestion-continuidad/gestion-continuidad.component';
import { FinalizarOrdenMedica } from 'src/app/models/orden-medica/FinalizarOrden';
import { RegistrarautorizacionComponent } from '../logeado/registrarautorizacion/registrarautorizacion.component';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { ConsultaService } from '../../service/citas/consulta.service';
import * as moment from 'moment';
import { SelectCitaComponent } from '../../modals/select-cita/select-cita.component';
import { DiagnostivosService } from 'src/app/service/catalogos/diagnosticos.service';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-radica-orden-medica',
  templateUrl: './radica-orden-medica.component.html',
  styleUrls: ['./radica-orden-medica.component.less'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-US' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class RadicaOrdenMedicaComponent implements OnInit {
  sessionUser: any = this.authenticatedService.getUser();
  isLinear = false;
  fbOrdenMedica: FormGroup;
  orden: any;
  fbRadicar: FormGroup;
  date = new Date();
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  especialidades: any[] = [];
  filteredEspList: Observable<string[]>;
  subEspecialidadesAll: any[] = [];
  subEspecialidades: any[] = [];
  filteredSubEspList: Observable<string[]>;
  serviciosAll: any[] = [];
  servicios: any[] = [];
  filteredServList: Observable<string[]>;
  sedes: any[] = [];
  filteredSedeList: Observable<string[]>;
  convenios: any[] = [];
  filteredConvList: Observable<string[]>;
  medicos: any[] = [];
  filteredMedList: Observable<string[]>;
  cies: any = [];
  viewDocument: any;
  ordenMedica: OrdenMedica;
  adminOrdenMedica: AdminOrdenMedica = new AdminOrdenMedica();
  fileSharePoint: FileSharePoint = new FileSharePoint();
  consultaPrestaciones: CaPrestacionesOrdMed;
  progress: boolean;
  citas: any[];
  timer: any;
  counter: number = 25;
  code: string;
  filteredDiagnostico: Observable<any[]>;
  numeroPolizaReadonly = true;

  constructor(private fb: FormBuilder,
    private authenticatedService: AuthenticatedService,
    private especialidadService: EspecialidadService,
    private serviciosService: ServiciosService,
    private sedesService: SedesService,
    private cieService: CieService,
    private clasificacionService: ClasificacionService,
    private convenioService: ConvenioService,
    private consultarordenService: ConsultarordenService,
    private medicoService: MedicoService,
    private ordenService: OrdenService,
    private consulta: ConsultaService,
    private spinner: NgxSpinnerService,
    private bloqueoService: BloqueoService,
    private uploadFileService: UploadFileService,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    private cookie: CookieService,
    private router: Router,
    private diagnosticoService: DiagnostivosService) {
    this.fbOrdenMedica = this.fb.group({
      serSerCodigo: [null, [Validators.minLength(3)]],
      serSerDesc: [null, [Validators.minLength(3)]],
      prePreCodigo: [null, [Validators.minLength(3)]],
      prePreDesc: [null, [Validators.minLength(3)]]
    });
    // this.counter * 60000
    this.timer = setInterval(() => { this.alertUnlock(); }, this.counter * 60000);
  }

  ngOnInit() {


    this.setLists();
    this.fbRadicar = this.fb.group({
      ecPolizaNumero: [''],  //  Validators.pattern(/^(?!.*(.)\1{9})/),
      // Validators.pattern(/^[A-Za-z0-9\s]+$/), Validators.minLength(3)]],
      dorFechaOrdenmString: [{ disabled: true, value: null }, [Validators.required]],
      serEspCodigo: ['', [Validators.required, this.checkList(this.especialidades)]],
      serSerCodSubEspe: ['', [Validators.required, this.checkList(this.subEspecialidades)]],
      serSerCodigo: ['', [Validators.required, this.checkList(this.servicios)]],
      pcaAgeLugar: ['', [Validators.required, this.checkList(this.sedes)]],
      diaAgrCodigo: ['', [Validators.required]],
      diaOtroAgr: [null],
      conConCodigo: ['', [Validators.required, this.checkList(this.convenios)]],
      pcaAgeCodigProfe: ['', [Validators.required, this.checkList(this.medicos)]]
    });

    const id = JSON.parse(localStorage.getItem('orden'));
    if (id === null) {
      this.router.navigate(['/ordenes']);
      return;
    } else {
      this.spinner.show();
      this.ordenService.getDetailOrden(id).subscribe(
        (data: OrdenMedica) => {
          this.timer = setInterval(() => { this.alertUnlock() }, this.counter * 60000);
          this.ordenMedica = data;

          console.log("Test 100", this.ordenMedica);
          this.orden = this.ordenMedica.ormFilename;
          console.log("Test 102", this.orden);


          /*
          var f:any;
          f = this.subEspecialidades.find(i => i.id === this.ordenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe.trim());
          console.log("Test 200", f.descripcion);
          
          this.ordenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe = f.descripcion;
          console.log("Test 400", this.ordenMedica.caDetalleOrdenesMedicas);
         
                    
          if (this.ordenMedica.conTipoConvenio === "A" || this.ordenMedica.conTipoConvenio === "S" ) {
                this.numeroPolizaReadonly = false;
                this.fbRadicar.controls['ecPolizaNumero'].setValidators([Validators.required]);
            } else {
              this.fbRadicar.controls['ecPolizaNumero'].setValidators([]);
            }   */


          if (this.ordenMedica.caDetalleOrdenesMedicas === null) {
            this.ordenMedica.caDetalleOrdenesMedicas = new DetalleOrdenMedica();
            this.consultarCitas();
          } else {
            // this.spinner.hide();
            if (this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar) {
              this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar = this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar.trim();
              this.consultarCitas();
            } else {
              this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar = '01';
              this.consultarCitas();
            }
          }
          this.download();
        }, (error) => {
          this.spinner.hide();
          swal({
            title: 'Error',
            text: 'No se pudo obtener la información de la derivación',
            icon: 'warning',
          });
        });
    }
  }


  onSubmit() {


    // var code: any;

    const detalleOrdenMedica: DetalleOrdenMedica = Object.assign(new DetalleOrdenMedica(), this.fbRadicar.getRawValue());

    // this.adminOrdenMedica.caDetalleOrdenesMedicas = detalleOrdenMedica;

    // code = this.subEspecialidades.find(datosSubes => datosSubes.descripcion === this.adminOrdenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe.trim());
    // this.adminOrdenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe = code.id;
    this.adminOrdenMedica.caDetalleOrdenesMedicas = detalleOrdenMedica;
    this.adminOrdenMedica.caDetalleOrdenesMedicas.ormIdOrdmNumero = this.ordenMedica.ormIdOrdmNumero;
    this.adminOrdenMedica.caDetalleOrdenesMedicas.pacPacTipoIdentCodigo = this.ordenMedica.pacPacTipoIdentCodigo;
    this.adminOrdenMedica.caDetalleOrdenesMedicas.pacPacRut = this.ordenMedica.pacPacRut;
    this.adminOrdenMedica.caDetalleOrdenesMedicas.pacPacNumero = this.ordenMedica.pacPacNumero;
    this.adminOrdenMedica.caDetalleOrdenesMedicas.pcaAgeCodigRecep = this.sessionUser.uid;
    this.adminOrdenMedica.codUsrCita = this.sessionUser.uid;
    this.adminOrdenMedica.dorFechaOrdenmString = "2020-11-20T05:00:00.000Z";

    console.log(this.adminOrdenMedica.dorFechaOrdenmString);


    this.adminOrdenMedica.ecPolizaNumero = this.fbRadicar.get('ecPolizaNumero').value;
    this.spinner.show();
    this.adminOrdenMedica.caDetalleOrdenesMedicas.diaAgrCodigo = this.fbRadicar.get('diaAgrCodigo').value.diaAgrCodigo;
    this.ordenService.createDetailOrden(this.adminOrdenMedica).subscribe(
      (data) => {
        this.spinner.hide();
        swal({
          title: 'Proceso exitoso!',
          text: 'Derivación REGISTRADA exitosamente',
          icon: 'success',
        });
        this.ordenMedica.eomIdCodigo = 2;
        this.unlockFirebase();
        // this.firestore.doc('lockRadica/' + this.cookie.get('idBlockRadica')).delete();
        // this.cookie.delete('idBlockRadica');
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        swal({
          title: 'Error',
          text: 'No se pudo registrar la derivación, por favor contactar con soporte',
          icon: 'warning',
        });
      }
    );
  }

  onSubmitPrestacion() {
    if ((this.fbOrdenMedica.get('serSerCodigo').value === null || this.fbOrdenMedica.get('serSerCodigo').value.trim() === '') &&
      (this.fbOrdenMedica.get('serSerDesc').value === null || this.fbOrdenMedica.get('serSerDesc').value.trim() === '')) {
      swal({
        title: 'Error',
        text: 'Debe digitar un código de servicio ó una descripción de servicio',
        icon: 'warning',
      });
      return;
    }

    this.consultaPrestaciones = Object.assign(new CaPrestacionesOrdMed(), this.fbOrdenMedica.value);
    if (!this.validateFormPres()) {
      swal({
        title: 'Error',
        text: 'Se debe rellenar por lo menos un campo',
        icon: 'warning',
      });
      return;
    }
    this.spinner.show();

    if (this.consultaPrestaciones.serSerDesc !== undefined && this.consultaPrestaciones.serSerDesc !== null &&
      this.consultaPrestaciones.serSerDesc.trim() !== '') {
      this.consultaPrestaciones.serSerDesc = this.consultaPrestaciones.serSerDesc.toUpperCase();
    }

    if (this.consultaPrestaciones.prePreDesc !== undefined && this.consultaPrestaciones.prePreDesc !== null &&
      this.consultaPrestaciones.prePreDesc.trim() !== '') {
      this.consultaPrestaciones.prePreDesc = this.consultaPrestaciones.prePreDesc.toUpperCase();
    }


    this.consultarordenService.consultaPrestaciones(this.consultaPrestaciones).subscribe(
      (data: CaPrestacionesOrdMed[]) => {
        this.spinner.hide();
        if (data.length > 0) {
          if (data.length === 1) {
            // if (this.ordenMedica.caPrestacionesOrdMed.filter(
            //   p => {
            //     const v = p.prePreCodigo.trim() === data[0].prePreCodigo.trim();
            //     return v;
            //   }
            // ).length === 0) {
            //   this.ordenMedica.caPrestacionesOrdMed.push(data[0]);
            // } else {
            //   swal({
            //     title: 'Error',
            //     text: 'La prestación ya está asociada a la derivación',
            //     icon: 'warning',
            //   });
            // }

            this.dialog.open(SelectPrestacionComponent, {
              height: '500px',
              data: data
            }).afterClosed().subscribe(
              (data: CaPrestacionesOrdMed) => {
                if (data != null) {
                  if (this.ordenMedica.caPrestacionesOrdMed.filter(p => p.prePreCodigo === data.prePreCodigo).length === 0) {
                    this.ordenMedica.caPrestacionesOrdMed.push(data);
                  } else {
                    swal({
                      title: 'Error',
                      text: 'La prestación ya está asociada a la derivación',
                      icon: 'warning',
                    });
                  }
                }
              });
          } else {
            this.dialog.open(SelectPrestacionComponent, {
              height: '500px',
              data: data
            }).afterClosed().subscribe(
              (data: CaPrestacionesOrdMed) => {
                if (data != null) {
                  if (this.ordenMedica.caPrestacionesOrdMed.filter(p => p.prePreCodigo === data.prePreCodigo).length === 0) {
                    this.ordenMedica.caPrestacionesOrdMed.push(data);
                  } else {
                    swal({
                      title: 'Error',
                      text: 'La prestación ya está asociada a la derivación',
                      icon: 'warning',
                    });
                  }
                }
              });
          }
        } else {
          swal({
            title: 'Sin información',
            text: 'No se encontró información con los filtros establecidos',
            icon: 'warning',
          });
        }
      }, err => {
        this.spinner.hide();
        swal({
          title: 'Error',
          text: 'No se pudo consultar las prestaciones, por favor consulte con soporte',
          icon: 'warning',
        });
      });
  }

  createPrestacion() {
    this.spinner.show();
    let crearPrestacionesOrdMed: CrearPrestacionesOrdMed = new CrearPrestacionesOrdMed();
    crearPrestacionesOrdMed.ormIdOrdmNumero = this.ordenMedica.ormIdOrdmNumero;
    crearPrestacionesOrdMed.pcaAgeCodigRecep = this.sessionUser.uid;
    crearPrestacionesOrdMed.caPrestacionesOrdMed = this.ordenMedica.caPrestacionesOrdMed;
    this.ordenService.createPrestaciones(crearPrestacionesOrdMed).subscribe(
      (data: CaPrestacionesOrdMed[]) => {
        this.spinner.hide();
        if (data) {
          swal({
            title: 'Proceso exitoso!',
            text: 'Derivación RADICADA exitosamente',
            icon: 'success',
          });
          this.ordenMedica.caPrestacionesOrdMed = data;
          this.ordenMedica.eomIdCodigo = 3;
          this.bloqueoService.unLock('lockRadica/');
          clearInterval(this.timer);
          this.router.navigate(['/autorizacion']);
        } else {
          swal({
            title: 'Error',
            text: 'No se pudó crear las prestaciones, por favor intentar nuevamente',
            icon: 'warning',
          });
        }
        this.bloqueoService.unLock('lockRadica/');
        clearInterval(this.timer);
      }, err => {
        this.spinner.hide();
        swal({
          title: 'Error',
          text: 'No se pudó crear las prestaciones, por favor intentar nuevamente',
          icon: 'warning',
        });
      });
  }

  validateFormPres(): boolean {
    return (this.consultaPrestaciones.serSerCodigo != null && this.consultaPrestaciones.serSerCodigo.length > 0)
      || (this.consultaPrestaciones.serSerDesc != null && this.consultaPrestaciones.serSerDesc.length > 0)
      || (this.consultaPrestaciones.prePreCodigo != null && this.consultaPrestaciones.prePreCodigo.length > 0)
      || (this.consultaPrestaciones.prePreDesc != null && this.consultaPrestaciones.prePreDesc.length > 0)
  }

  eliminarPrestacion(prestacion: CaPrestacionesOrdMed) {
    const i = this.ordenMedica.caPrestacionesOrdMed.findIndex(x => x.prePreCodigo === prestacion.prePreCodigo);
    this.ordenMedica.caPrestacionesOrdMed.splice(i, 1);
  }

  download() {
    this.createFileSharePoint();
    this.fileSharePoint.nombreArchivo = this.ordenMedica.ormFilename;
    this.progress = true;
    this.uploadFileService.downloadFile(this.fileSharePoint).subscribe(
      data => {
        if (data != null) {
          const reader = new FileReader();
          reader.readAsDataURL(data);
          const myClass = this;
          reader.onloadend = function () {
            myClass.progress = false;
            const base64data = reader.result;
            myClass.orden = 'data:image/jpg;base64,' + base64data.toString().split(",")[1];
          }
        } else {
          swal({
            title: 'Información',
            text: 'No se pudo obtener el documento almacenado para la derivación.',
            icon: 'info',
          });
          this.progress = false;
        }
      }, error => {
        this.progress = false;
        swal({
          title: 'Error',
          text: 'No se pudo consultar descargar el archivo, por favor intentelo nuevamente',
          icon: 'warning',
        });
        console.log(error);
      }
    );
  }

  createFileSharePoint() {
    this.fileSharePoint.pac = new PacienteSharePoint();
    this.fileSharePoint.pac.tipoDocId = this.ordenMedica.tipTipIDav;
    this.fileSharePoint.pac.numDocId = this.ordenMedica.pacPacRut;

    // this.fileSharePoint.pac.tipoDocId = "RC";
    // this.fileSharePoint.pac.numDocId = "1145934247";


    this.fileSharePoint.archivoGral = false;
    this.fileSharePoint.ormIdOrdmNumero = this.ordenMedica.ormIdOrdmNumero;
    this.fileSharePoint.fecha = this.ordenMedica.fechaRegistroFile;
  }

  private setLists() {
    this.medicoService.getMedicos().subscribe(data => {

      this.medicos = data;
      this.filteredMedList = this.fbRadicar.get('pcaAgeCodigProfe').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.medicos))
        );
    });

    this.especialidadService.getEspecialidades().subscribe(data => {
      this.especialidades = data;
      this.filteredEspList = this.fbRadicar.get('serEspCodigo').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.especialidades))
        );
    });
    this.serviciosService.getSubEspecialidades().subscribe(data => {
      this.subEspecialidades = data;
      this.subEspecialidadesAll = data;

      this.filteredSubEspList = this.fbRadicar.get('serSerCodSubEspe').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.subEspecialidades))
        );
    });


    this.serviciosService.getServicios().subscribe(data => {
      this.servicios = data;
      this.serviciosAll = data;
      this.filteredServList = this.fbRadicar.get('serSerCodigo').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.servicios))
        );
    });
    this.sedesService.getSedes().subscribe(data => {
      this.sedes = data;
      this.filteredSedeList = this.fbRadicar.get('pcaAgeLugar').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.sedes))
        );
    });
    this.convenioService.getConvenio().subscribe(data => {
      this.convenios = data;

      this.filteredConvList = this.fbRadicar.get('conConCodigo').valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.convenios))
        );
    });

    this.diagnosticoService.diagnosticos().subscribe(data => {
      this.cies = data;
      this.filteredDiagnostico = this.fbRadicar.get('diaAgrCodigo').valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return this._filterDiag(value, this.cies)
          })
        );
    });
  }

  openDialogGestion(pomIdPrestOrdm: number): void {
    const dialogRef = this.dialog.open(GestionContinuidadComponent, {
      data: {
        pomIdPrestOrdm: pomIdPrestOrdm
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.ordenMedica.caPrestacionesOrdMed
          .filter(cp => cp.pomIdPrestOrdm === pomIdPrestOrdm)[0].caTrazaGestContinuidad = result;
        if (!this.validContinuidadStep()) {
          swal({
            title: 'Proceso exitoso!',
            text: 'Derivación ACTUALIZADA exitosamente',
            icon: 'success',
          });
          this.router.navigate(['/autorizacion']);
        }
      }
    });
  }

  openDialogAutorizacion(pomIdPrestOrdm: number): void {
    const dialogRef = this.dialog.open(RegistrarautorizacionComponent, {
      data: {
        pomIdPrestOrdm: pomIdPrestOrdm,
        pacPacNumero: this.ordenMedica.pacPacNumero
      },
      height: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.ordenMedica.caPrestacionesOrdMed
          .filter(cp => cp.pomIdPrestOrdm === pomIdPrestOrdm)[0].caGestionAutorizacion = result;
      }
    });
  }

  getState(idState) {
    if (idState === 1 || idState === '1') {
      return 'Aceptada';
    } else if (idState === 2 || idState === '2') {
      return 'No aceptada';
    } else if (idState === 3 || idState === '3') {
      return 'No contesta';
    }
  }

  validContinuidadStep() {
    let caPrestacionesOrdMed: CaPrestacionesOrdMed[] = this.ordenMedica.caPrestacionesOrdMed.filter(cp => cp.caTrazaGestContinuidad === null);
    return (caPrestacionesOrdMed != null && caPrestacionesOrdMed.length > 0);
  }

  validFinalStep() {
    let caPrestacionesOrdMed: CaPrestacionesOrdMed[] = this.ordenMedica.caPrestacionesOrdMed.filter(cp => cp.caGestionAutorizacion === null && (cp.caTrazaGestContinuidad == null || cp.caTrazaGestContinuidad.gcoIdCodigoEstado !== 2));
    return (caPrestacionesOrdMed != null && caPrestacionesOrdMed.length > 0);
  }

  finalizarOrden() {
    this.spinner.show();
    let finalizarOrdenMedica: FinalizarOrdenMedica = new FinalizarOrdenMedica();
    finalizarOrdenMedica.ormIdOrdmNumero = this.ordenMedica.ormIdOrdmNumero;
    finalizarOrdenMedica.pcaAgeCodigRecep = this.sessionUser.uid;
    this.ordenService.finalizarOrden(finalizarOrdenMedica).subscribe(
      (data: Boolean) => {
        this.spinner.hide();
        if (data) {
          swal({
            title: 'Proceso exitoso!',
            text: 'Derivación AUTORIZADA exitosamente',
            icon: 'success',
          });
          this.ordenMedica.eomIdCodigo = 4;
          this.bloqueoService.unLock('lockRadica/');
          clearInterval(this.timer);
          this.router.navigate(['/autorizacion']);
        } else {
          swal({
            title: 'Error',
            text: 'No se actualizar la derivación, por favor intentar nuevamente',
            icon: 'warning',
          });
        }
        this.bloqueoService.unLock('lockRadica/');
        clearInterval(this.timer);
      }, err => {
        this.spinner.hide();
        swal({
          title: 'Error',
          text: 'No se actualizar la derivación, por favor intentar nuevamente',
          icon: 'warning',
        });
      });
  }

  displayFn1(id) {
    if (id) {
      return this.especialidades.filter(i => i.id === id.trim())[0].descripcion;
    }
  }

  displayFn2(id) {
    if (id) {
      let objeto;

      objeto = this.subEspecialidades.filter(i => {
        const b = i.id === id.trim();
        return b;
      })[0];
      if (objeto == undefined) {
        objeto = this.subEspecialidades.filter(i => {
          const b = i.descripcion === id.trim();
          return b;
        })[0];

        if (objeto == undefined) {
          objeto = this.subEspecialidades.filter(i => {
            const b = i.otro === id.trim();
            return b;
          })[0];

        }


        return objeto.descripcion;

      } else {
        return objeto.descripcion;
      }

    }
  }

  displayFn3(id) {
    if (id) {


      if (this.servicios != undefined) {
        if (this.servicios.length > 0) {

          return this.servicios.filter(i => i.id === id.trim())[0].descripcion;
        }
      }
      return "";
    }
  }

  displayFn4(id) {
    if (id) {

      if (this.sedes != undefined) {
        if (this.sedes.length > 0) {

          let objeto;

          objeto = this.sedes.filter(i => {
            const b = i.id === id.trim();
            return b;
          })[0];
          if (objeto == undefined) {
            objeto = this.sedes.filter(i => {
              const b = i.otro === id.trim();
              return b;
            })[0];
            return objeto.descripcion;
          } else {
            return objeto.descripcion;
          }

        }
      }
      return "";
    }
  }

  displayFn5(id) {
    if (id) {

      if (this.convenios != undefined) {
        if (this.convenios.length > 0) {
          return this.convenios.filter(i => i.id === id.trim())[0].descripcion;
        }
      }
      return "";
    }
  }

  displayFn6(id) {
    if (id) {
      if (this.medicos != undefined) {
        if (this.medicos.length > 0) {
          return this.medicos.filter(i => i.id === id.trim())[0].descripcion;
        }
      }
      return "";

    }
  }

  displayFnDiag(cie) {
    if (cie) {
      return cie.diaDiaDescripcion;
    }
  }

  private _filter(value: string, list: any[]): string[] {
    if (typeof value === "string") {
      if (value.length === 0) return list;
      const filterValue = value.toLowerCase();
      return list.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
  }

  private _filterDiag(value: string, list: any[]): string[] {
    if (typeof value === "string") {
      if (value.length === 0) return list;
      const filterValue = value.toLowerCase();
      return list.filter(option => option.diaDiaDescripcion.toLowerCase().includes(filterValue));
    }
  }

  changeSubs() {
    const code = this.fbRadicar.get('serEspCodigo').value;
    this.fbRadicar.patchValue({ serSerCodSubEspe: '' });
    this.fbRadicar.patchValue({ serSerCodigo: '' });
    this.subEspecialidades = this.subEspecialidadesAll;
    if (code) {
      this.subEspecialidades = this.subEspecialidades.filter(sub => sub.otro === code.trim());
    }
    this.filteredSubEspList = this.fbRadicar.get('serSerCodSubEspe').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.subEspecialidades))
      );
  }

  changeDiagnostico() {
    const code = this.fbRadicar.get('serSerCodigo').value;

    if (code) {
      this.cieService.getCieWithService(code).subscribe(data => {
        this.cies = data;
        this.filteredDiagnostico = this.fbRadicar.get('diaAgrCodigo').valueChanges
          .pipe(
            startWith(''),
            map(value => {
              return this._filterDiag(value, this.cies)
            })
          );
      });
    }
  }

  /*
  changeServs() {
    const codeEsp = this.fbRadicar.get('serEspCodigo').value;
    const codeserSerCodSubEspe = this.fbRadicar.get('serSerCodSubEspe').value;
        
    var code: any = {};

    code = this.subEspecialidades.find(datosSubespecialidad => datosSubespecialidad.descripcion === codeserSerCodSubEspe.trim());
    
    this.fbRadicar.patchValue({ servicio: '' });


    this.servicios = this.serviciosAll;
    if (code.id) {
      // this.servicios = this.servicios.filter(ser => ser.otro === code);
      this.servicios = this.servicios.filter(ser => ser.otro === code.id.trim() && ser.otros === codeEsp.trim());

    }

    this.filteredServList = this.fbRadicar.get('serSerCodigo').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.servicios))
      );
  } */


  changeServs() {
    const codeEsp = this.fbRadicar.get('serEspCodigo').value;
    const code = this.fbRadicar.get('serSerCodSubEspe').value;
    this.fbRadicar.patchValue({ servicio: '' });
    this.servicios = this.serviciosAll;
    if (code) {
      // this.servicios = this.servicios.filter(ser => ser.otro === code);
      this.servicios = this.servicios.filter(ser => ser.otro === code.trim() && ser.otros === codeEsp.trim());
    }

    this.filteredServList = this.fbRadicar.get('serSerCodigo').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.servicios))
      );
  }



  checkList(itemsChek): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const item = control.value;
      if (item != null && item.length > 0 && !itemsChek.filter(i => i.id === item)[0] === null) {
        return { 'matchList': item };
      }
      return null;
    };
  }

  consultarCitas() {
    const userData = {
      numeroDocumento: this.ordenMedica.pacPacRut,
      fecha: moment(new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate())),
      fechaFinal: moment(new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate())),
      especialidad: '',
      subEspecialidad: '',
      servicio: '',
      sede: '',
      estado: ''
    }
    this.consulta.getCitas(userData, '').subscribe(
      data => {
        this.spinner.hide();
        if (Object.keys(data).length > 0) {
          this.citas = data;
          this.cookie.set('Intervalo', this.timer.toString());
          // if (this.citas.length === 1) {
          //   this.ordenMedica.caDetalleOrdenesMedicas.serEspCodigo = this.citas[0].codEspecialidad;
          //   this.ordenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe = this.citas[0].codSubespecialidad;
          //   this.ordenMedica.caDetalleOrdenesMedicas.serSerCodigo = this.citas[0].codServicio;
          //   this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar = this.citas[0].codCentroAten;
          //   this.ordenMedica.caDetalleOrdenesMedicas.conConCodigo = this.citas[0].codConvenio[0];
          //   this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeCodigProfe = this.citas[0].codProf;
          // } else {
          this.dialog.open(SelectCitaComponent, {
            height: '500px',
            data: this.citas
          }).afterClosed().subscribe(
            (data: any) => {
              if (data !== null) {

                this.ordenMedica.caDetalleOrdenesMedicas.serEspCodigo = data.codEspecialidad;
                this.ordenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe = data.codSubespecialidad;
                this.ordenMedica.caDetalleOrdenesMedicas.serSerCodigo = data.codServicio;
                this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar = data.letraCodCentroAten;
                this.ordenMedica.caDetalleOrdenesMedicas.conConCodigo = data.codConvenio[0];
                this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeCodigProfe = data.codProf;
              }
            });
          // }
        } else {
          // this.unlockFirebase();
          // this.router.navigate(['/autorizacion']);
          swal({
            title: 'Sin resultados',
            text: 'El paciente no tiene citas para el día de hoy, por favor registre los datos que aparecen en la orden medica pre radicada',
            icon: 'info',
          });
          // }
        }
      }, (error) => {
        this.spinner.hide();
        swal({
          title: 'Error',
          text: 'No se pudo obtener información de las citas',
          icon: 'warning',
        });
      });
  }

  clear() {
    this.fbOrdenMedica.reset();
  }

  alertUnlock(): string {
    if (this.cookie.check('lock')) {
      swal({
        title: 'Desbloqueo',
        text: '¿Desea que se desbloquee la cita?',
        icon: 'warning',
        buttons: ['Continuar', 'Desbloquear'],
        dangerMode: true
      }).then((unLock) => {
        this.timer = setInterval(() => { this.bloqueoService.unLockAll() }, 10 * 60000);
        if (unLock !== null) {
          this.bloqueoService.unLockAll();
          clearInterval(this.timer);
          swal('Se ha desbloqueado la cita correctamente', {
            icon: 'success',
          });
          this.router.navigate(['/autorizacion']);
        } else {
          clearInterval(this.timer);
          this.timer = setInterval(() => { this.alertUnlock() }, this.counter * 60000);
        }
      });
    }
    return 'true';
  }

  unlockFirebase() {
    this.bloqueoService.unLock('lockRadica/');
    clearInterval(this.timer);
  }


  sidenavtoggle() {

    alert("Hola mundo");

  }

}
