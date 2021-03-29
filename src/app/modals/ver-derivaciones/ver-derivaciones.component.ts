import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import swal from 'sweetalert';
import { EspecialidadService } from 'src/app/service/catalogos/especialidades.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DetalleOrdenMedica } from 'src/app/models/orden-medica/DetalleOrdenMedica';
import { AdminOrdenMedica } from 'src/app/models/orden-medica/AdminOrdenMedica';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { OrdenMedica } from 'src/app/models/orden-medica/OrdenMedica';
import { GestionContinuidadService } from 'src/app/service/citas/gestioncontinuidad.service';
import { GestionContinuidad } from 'src/app/models/gestion-continuidad/GestionContinuidad';
import { RespuestaGestionContinuidad } from 'src/app/models/gestion-continuidad/RespuestaGestionContinuidad';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ServiciosService } from 'src/app/service/catalogos/servicios.service';
import { CieService } from 'src/app/service/catalogos/cie.service';
import { ClasificacionService } from 'src/app/service/catalogos/clasificacion.service';
import { ConvenioService } from 'src/app/service/catalogos/convenio.service';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import { MedicoService } from 'src/app/service/catalogos/medico.service';
import { SedesService } from 'src/app/service/catalogos/sedes.service';
import { RegistrarautorizacionCitaComponent } from 'src/app/component/logeado/registrarautorizacioncita/registrarautorizacioncita.component';
import { CaGestionAutorizacionCita } from 'src/app/models/orden-medica/CaGestionAutorizacionCita';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { Userlock } from 'src/app/models/firebase/userlock';
import { Bloqueo } from 'src/app/models/firebase/bloqueo';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';

@Component({
  selector: 'app-ver-derivaciones',
  templateUrl: './ver-derivaciones.component.html',
  styleUrls: ['./ver-derivaciones.component.less']
})
export class VerDerivacionesComponent implements OnInit {
  fbRadicar: FormGroup;
  adminOrdenMedica: AdminOrdenMedica = new AdminOrdenMedica();
  sessionUser: any = this.authenticatedService.getUser();
  ordenMedica: OrdenMedica;
  continuidad: FormGroup;
  verCard: boolean;
  gestionContinuidad: GestionContinuidad;
  filteredEspList: Observable<string[]>;
  especialidades: any[] = [];

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
  cies: any;
  subEspecialidadesAll: any[] = [];
  subEspecialidades: any[] = [];
  date = new Date();
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  idFire: any;
  fireCA: any;
  user: any;
  dataLock: Bloqueo = new Bloqueo();
  valor: any;
  resultados: any;
  metodo: any;
  nombreCompleto: string;
  tipoDoc: string;
  numeroDoc: string;

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private ordenService: OrdenService,
    public spinnerService: NgxSpinnerService,
    private serviciosService: ServiciosService,
    private especialidadService: EspecialidadService,
    private authenticatedService: AuthenticatedService,
    private cieService: CieService,
    private clasificacionService: ClasificacionService,
    private convenioService: ConvenioService,
    private sedesService: SedesService,
    private consultarordenService: ConsultarordenService,
    private medicoService: MedicoService,
    public gestionContinuidadService: GestionContinuidadService,
    public dialogRef: MatDialogRef<VerDerivacionesComponent>,
    private bloqueoService: BloqueoService,
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    private cookie: CookieService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.user = cookie.get('cenAuth');
    this.user = JSON.parse(atob(this.user));
  }


  ngOnInit() {
    this.continuidad = this.fb.group({
      gcoIdCodigoEstado: [null, [Validators.required]],
      gcoDirecPaciente: [false, [Validators.required]],
      gcoRealizoAgendamiento: [false, [Validators.required]],
      gcoIdCodigoMotivo: [null],
      gcoObservaciones: [null],
      enviarCorreo: [true, [Validators.required]]
    })


    const id = JSON.parse(localStorage.getItem('ordenId'));
    if (id === null) {
      this.close()
      return;
    } else {
      this.spinner.show();
      this.ordenService.getDetailOrden(id).subscribe(
        (data: OrdenMedica) => {
          let caPrestacionesOrdMed: Array<CaPrestacionesOrdMed> = data.caPrestacionesOrdMed;
          if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
            caPrestacionesOrdMed.length > 0) {
            caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caPrestacion: CaPrestacionesOrdMed) => {
              return caPrestacion.caGestionAutorizacion === null ||
                caPrestacion.caGestionAutorizacion.gauAutorizaServ === '3'
            });
          }
          data.caPrestacionesOrdMed = caPrestacionesOrdMed;
          this.ordenMedica = data;
          this.nombreCompleto = this.ordenMedica.nombreCompletoPaciente;
          this.tipoDoc = this.ordenMedica.tipTipIDav;
          this.numeroDoc = this.ordenMedica.pacPacRut;
          this.setLists();
        }, (error) => {
          swal({
            title: 'Error',
            text: 'No se pudo obtener la información de la derivación',
            icon: 'warning',
          });
        });

      this.ordenService.getDetailOrden(id).subscribe((data: OrdenMedica) => {
        this.spinnerService.hide();

        let caPrestacionesOrdMed: Array<CaPrestacionesOrdMed> = data.caPrestacionesOrdMed;
        if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
          caPrestacionesOrdMed.length > 0) {
          caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caPrestacion: CaPrestacionesOrdMed) => {
            return caPrestacion.caGestionAutorizacion === null ||
              caPrestacion.caGestionAutorizacion.gauAutorizaServ === '3'
          });
        }
        data.caPrestacionesOrdMed = caPrestacionesOrdMed;
        this.ordenMedica = data;
        if (this.ordenMedica.caPrestacionesOrdMed.length > 0) {
          this.verCard = true;
        } else {
          // this.close();
        }
      }, err => {
        this.spinnerService.hide();
        // this.close();
      });
    }
  }

  closeWithData(data: any) {
    this.dialogRef.close(data);
    this.unlock()
  }

  close() {
    this.dialogRef.close();
    this.unlock()
  }
  changeChecks(value) {
    if (value === '1') {
      this.continuidad.controls['gcoDirecPaciente'].enable();
      this.continuidad.controls['gcoRealizoAgendamiento'].enable();
      this.continuidad.get("gcoDirecPaciente").setValue(true);
      this.continuidad.get("gcoRealizoAgendamiento").setValue(true);
    } else if (value === '2') {
      this.continuidad.controls['gcoDirecPaciente'].enable();
      this.continuidad.controls['gcoRealizoAgendamiento'].enable();
      this.continuidad.get("gcoDirecPaciente").setValue(true);
      this.continuidad.get("gcoRealizoAgendamiento").setValue(false);
    } else {
      this.continuidad.get("gcoDirecPaciente").setValue(false);
      this.continuidad.get("gcoRealizoAgendamiento").setValue(false);
      this.continuidad.controls['gcoDirecPaciente'].disable();
      this.continuidad.controls['gcoRealizoAgendamiento'].disable();
    }
  }

  openDialogAutorizacion(datoCita, module, sedes?) {
    datoCita.codConvenio = [this.convenios[0].id];
    datoCita.codigoPrestacion = datoCita.prePreCodigo;
    datoCita.numeroPoliza = this.ordenMedica.caDetalleOrdenesMedicas.ecPolizaNumero;
    datoCita.ordenMedica = this.ordenMedica;
    datoCita.module = module;
    datoCita.sedes = sedes;
    this.dataLock.UserActive = new Userlock();
    this.dataLock.DateActive = datoCita.pomIdPrestOrdm;
    this.dataLock.UserActive.Documento = this.user.uid;
    this.dataLock.UserActive.Nombre = this.user.cn;
    if (localStorage.getItem('lock')) {
      this.bloqueoService.unLockAll()
    }
    this.metodo = this.bloqueoService.search('lockDerivaciones', this.dataLock.DateActive).subscribe(data => {
      this.unSubcribeFirebase()
      if (data.length) {
        this.resultados = data;
        swal({
          title: 'La autorización bloqueada',
          text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
          icon: 'info',
        });
      } else {
        this.valor = this.bloqueoService.lock(this.dataLock, 'lockDerivaciones');
        localStorage.setItem('lock', this.valor.key);
        const dialogRef = this.dialog.open(RegistrarautorizacionCitaComponent, {
          data: { datoCita },
          height: '500px',
          disableClose: true
        });
        dialogRef.afterClosed().subscribe((caGestionAutorizacion: CaGestionAutorizacion) => {
          if (caGestionAutorizacion != null) {
            // eliminamos el registro
            let caPrestacionesOrdMed: Array<CaPrestacionesOrdMed> = this.ordenMedica.caPrestacionesOrdMed;
            caPrestacionesOrdMed = caPrestacionesOrdMed.filter((v: CaPrestacionesOrdMed) => {
              const value = v.pomIdPrestOrdm !== caGestionAutorizacion.pomIdPrestOrdm;
              return value;
            })

            if (caPrestacionesOrdMed === undefined || caPrestacionesOrdMed === null || caPrestacionesOrdMed.length <= 0) {
              // cerramos el dialog todo esta autorizado o no autorizado, ninguno en proceso
              this.closeWithData(true);
              return;
            }
            if (caPrestacionesOrdMed.length === this.ordenMedica.caPrestacionesOrdMed.length) {
              // cerramos el dialog todo esta autorizado o no autorizado, ninguno en proceso
              this.closeWithData(true);
              return;
            }
            this.ordenMedica.caPrestacionesOrdMed = caPrestacionesOrdMed;

            this.bloqueoService.unLock('lockDerivaciones/');
          }
        });
      }
    })
  }

  selectCard(prestacion) {

  }


  private setLists() {
    this.especialidadService.getEspecialidades().subscribe(data => {
      this.especialidades = data;
      this.especialidades = this.especialidades.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.serEspCodigo)
    });
    this.serviciosService.getSubEspecialidades().subscribe(data => {
      this.subEspecialidades = data;
      this.subEspecialidades = this.subEspecialidades.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.serSerCodSubEspe)
    });
    this.serviciosService.getServicios().subscribe(data => {
      this.servicios = data;
      this.servicios = this.servicios.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.serSerCodigo)
    });
    this.sedesService.getSedes().subscribe(data => {
      this.sedes = data;

      if (this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar == undefined) {

        this.sedes = this.sedes.filter(data => data.id === '01');

      } else {
        this.sedes = this.sedes.filter(data => data.otro === this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar.trim())
        if (this.sedes.length == 0) {
          this.sedes = data;
          this.sedes = this.sedes.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeLugar.trim())

        }
      }

    });
    this.convenioService.getConvenio().subscribe(data => {
      this.convenios = data;
      this.convenios = this.convenios.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.conConCodigo.trim())
    });
    this.medicoService.getMedicos().subscribe(data => {
      this.medicos = data;
      this.medicos = this.medicos.filter(data => data.id === this.ordenMedica.caDetalleOrdenesMedicas.pcaAgeCodigProfe)
    });
    this.cieService.getCie().subscribe(data => {
      this.cies = data;
      this.cies = this.cies.filter(data => data.codPrestacion === this.ordenMedica.caDetalleOrdenesMedicas.diaAgrCodigo)
    });
  }

  getState(state: number) {
    switch (state) {
      case 1: return 'ACEPTA';
      case 2: return 'NO ACEPTA';
      case 3: return 'NO CONTESTA';
      case 4: return 'AUTORIZADA';
      case 5: return 'AGENDADA';
      default: return '';
    }
  }

  unSubcribeFirebase() {
    this.metodo.unsubscribe();
  }

  unlock() {
    this.bloqueoService.unLock('lockDerivaciones/');
  }
}
