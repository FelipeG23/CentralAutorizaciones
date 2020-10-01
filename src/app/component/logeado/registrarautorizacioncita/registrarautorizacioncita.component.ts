import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, NgForm, FormGroupDirective, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatDialog, MatSelectChange } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { DetalleCitaService } from '../../../service/citas/detalle-cita.service';
import { CaGestionAutorizacionCita } from '../../../models/orden-medica/CaGestionAutorizacionCita';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AngularFirestore } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { InfoConvenioComponent } from 'src/app/modals/info-convenio/info-convenio.component';
import { ErrorStateMatcher } from '@angular/material';
import { GestionAutorizacionService } from 'src/app/service/citas/gestion-autorizacion.service';
import { GestionAutorizacionCita } from 'src/app/models/gestionAutorizacion';
import { CaPolizasPaciente } from 'src/app/models/caPolizasPaciente';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { FiltroDetalleCita } from 'src/app/models/filtro-detalle.cita';
import { DetalleCita } from 'src/app/models/detalle-cita';
import { ConsultaService } from 'src/app/service/citas/consulta.service';
import { MotivoNoAutorizaService } from 'src/app/service/catalogos/motivoNoAutoriza.service';
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
  selector: 'app-registrarautorizacioncita',
  templateUrl: './registrarautorizacioncita.component.html',
  styleUrls: ['./registrarautorizacioncita.component.less'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-US' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class RegistrarautorizacionCitaComponent implements OnInit {
  registrarAuto: FormGroup;
  date = new Date();
  minDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  maxDateAuto = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
  resultado: any;
  validDates = false;
  valorCuota: boolean;
  errorMatcher = new CrossFieldErrorMatcher();
  errorMatcherMotivo = new CrossFieldErrorMatcherMotivo();
  misValores: any;
  cuota: number;
  errorMatcherFechaAut = new CrossFieldErrorMatcherFechaAut();
  errorMatcherFechaVencimiento = new CrossFieldErrorMatcherFechaVencimiento();
  caminoRegistroSi = false;
  caminoRegistroNo = false;
  errorMatcherObservacion = new CrossFieldErrorMatcherObservaciones();
  errorMatcherPoliza = new CrossFieldErrorMatcherNumeroPoliza();
  errorMatcherOtroMotivo = new CrossFieldErrorMatcherOtroMotivo();
  errorMatcherCostoConvenio = new CrossFieldErrorMatcherCostoConvenio();
  errorMatcherCostoPaciente = new CrossFieldErrorMatcherCostoPaciente();
  caPrestacionesOrdMed: CaPrestacionesOrdMed;
  prestacion: any;
  detalleCita: DetalleCita;
  claseFormulario = 'col-sm-12';
  motivosNoAutoriza: any[];
  nombre: any;
  documentoPersona: any;
  listaConvenios: any = {};
  datosConvenio: any = {};


  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<RegistrarautorizacionCitaComponent>,
    public detalleCitaService: DetalleCitaService,
    public spinnerService: NgxSpinnerService,
    public authenticatedService: AuthenticatedService,
    private firestore: AngularFirestore,
    private cookie: CookieService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gestionAutorizacionService: GestionAutorizacionService,
    private ordenService: OrdenService,
    private consultarOrdenService: ConsultarordenService,
    private bloqueoService: BloqueoService,
    private consultaService: ConsultaService,
    private motivoNoAutorizaService: MotivoNoAutorizaService) {
  }

  ngOnInit() {
    this.setFormRegistra();
    this.setEstado();
    const valor = {
      'anio': this.date.getFullYear(),
      'codigoConvenio': this.data.datoCita.codConvenio[0].trim(),
      'codigoPrestacion': this.data.datoCita.codigoPrestacion.trim()
    };

    // se consulta el detalle de la cita de la persona
    this.spinnerService.show();
    this.consultaService.getCitaById(this.data.datoCita.idCita).subscribe((detalleCita: any) => {
      if (detalleCita !== null) {
        this.claseFormulario = 'col-sm-6';
      }
      this.spinnerService.hide();
      this.detalleCita = detalleCita;

    }, () => {
      this.spinnerService.hide();
    });

    const numeroPoliza = this.data.datoCita.numeroPoliza !== undefined && this.data.datoCita.numeroPoliza !== null ? this.data.datoCita.numeroPoliza.trim() : '';
    this.registrarAuto.get('numeroPoliza').setValue(numeroPoliza);

    if (numeroPoliza === '') {
      this.detalleCitaService.consultarPoliza(this.data.datoCita.pacNum).
        subscribe((poliza: CaPolizasPaciente) => {
          if (poliza !== null) {
            this.registrarAuto.get('numeroPoliza').setValue(poliza.ecPolizaNumero);
          }
        });
    }

    if (this.data.datoCita.module !== undefined && this.data.datoCita.module !== null &&
      this.data.datoCita.module === 'derivacion') {
      this.consultarOrdenService.consultarPrestacion(this.data.datoCita.pomIdPrestOrdm).
        subscribe((caPrestacionesOrdMed: CaPrestacionesOrdMed) => {
          this.caPrestacionesOrdMed = caPrestacionesOrdMed;
          this.setEstadoPrestacion();
        });
    }


    this.detalleCitaService.consultarValor(valor).subscribe(data => {
      this.valorCuota = true;
      this.registrarAuto.get('gauValorPrestacion').setValue(data[0].valorAmbulatorio);
      this.misValores = data;
    }, err => {
      this.valorCuota = false;
      this.registrarAuto.get('gauValorPrestacion').setValue(this.cuota);
    });

    this.motivoNoAutorizaService.getMotivoNoAutoriza().subscribe(data => {
      this.motivosNoAutoriza = data;
    });

  }

  camino() {
    if (this.registrarAuto.value.gauAutorizaServ === 1) {
      this.caminoRegistroSi = true;
    } else {
      this.caminoRegistroNo = true;
    }
  }

  onSubmit() {

    if (this.data.datoCita.module == 'derivacion') {
      const caGestionAutorizacion: CaGestionAutorizacion = Object.assign(new CaGestionAutorizacion(), this.registrarAuto.value);

      if (caGestionAutorizacion.gauAutorizaServ !== '2') {
        caGestionAutorizacion.mnaIdcodigo = null;
        caGestionAutorizacion.omnDesc = null;
      }
      caGestionAutorizacion.pomIdPrestOrdm = this.data.datoCita.pomIdPrestOrdm;
      caGestionAutorizacion.pacPacNumero = this.data.datoCita.ordenMedica.pacPacNumero;
      caGestionAutorizacion.gauVigenciaAutorizacion = this.registrarAuto.get('gauVigenciaAutorizacion').value;
      caGestionAutorizacion.pcaAgeCodigoRecep = this.authenticatedService.getUser().uid;
      caGestionAutorizacion.nombrePaciente = this.data.datoCita.ordenMedica.nombreCompletoPaciente;
      caGestionAutorizacion.centroAtencion = this.data.datoCita.sedes[0].descripcion;
      this.spinnerService.show();
      this.ordenService.registrarAutorizacion(caGestionAutorizacion).subscribe(
        (data: boolean) => {
          this.spinnerService.hide();
          if (data) {
            swal({
              title: 'Proceso exitoso',
              text: 'Datos actualizados!',
              icon: 'success',
            });
            this.dialogRef.close(caGestionAutorizacion);
          } else {
            swal({
              title: 'Error',
              text: 'Error registrando la autorización, por favor intente nuevamente',
              icon: 'warning',
            });
          }
          this.bloqueoService.unLockAll();
        }, err => {
          this.spinnerService.hide();
          swal({
            title: 'Error',
            text: 'Error registrando la autorización, por favor intente nuevamente',
            icon: 'warning',
          });
          this.bloqueoService.unLockAll();
        });

    } else {
      const caGestionAutorizacionCita: CaGestionAutorizacionCita = Object.assign(new CaGestionAutorizacionCita(), this.registrarAuto.value);

      console.log(caGestionAutorizacionCita);

      if (caGestionAutorizacionCita.gauAutorizaServ !== '2') {
        caGestionAutorizacionCita.mnaIdcodigo = null;
        caGestionAutorizacionCita.omnDesc = null;
      }
      caGestionAutorizacionCita.fechaCita = this.data.datoCita.fechaCita;
      caGestionAutorizacionCita.horaCita = this.data.datoCita.horaCita;
      caGestionAutorizacionCita.codUsrCita = this.data.datoCita.codUsrCita;
      caGestionAutorizacionCita.pacNum = this.data.datoCita.pacNum;
      caGestionAutorizacionCita.gauVigenciaAutorizacion = this.registrarAuto.get('gauVigenciaAutorizacion').value;
      caGestionAutorizacionCita.nombrePaciente = this.data.datoCita.nombreCompleto;
      caGestionAutorizacionCita.centroAtencion = this.detalleCita.nombreCentroAten;
      caGestionAutorizacionCita.pcaAgeCodigoRecep = this.authenticatedService.getUser().uid;

      console.log(this.data);

       this.spinnerService.show();

      this.detalleCitaService.registrarAutorizacion(caGestionAutorizacionCita).subscribe(
        (data: boolean) => {
          this.spinnerService.hide();
          this.bloqueoService.unLockAll();
          if (data) {
            swal({
              title: 'Proceso exitoso',
              text: 'Datos actualizados!',
              icon: 'success',
            });
            this.dialogRef.close(caGestionAutorizacionCita);
          } else {
            swal({
              title: 'Error',
              text: 'Error registrando la autorización, por favor intente nuevamente',
              icon: 'warning',
            });
          }
        }, (err) => {
          console.log(err);
          const messageError: any = err.error.error.message;
          this.spinnerService.hide();
          this.bloqueoService.unLockAll();
          swal({
            title: 'Error',
            text: messageError,
            icon: 'warning',
          });
        });  
    }
  }




  updateCalcs() {
    if (this.registrarAuto.get('gauFechaAutorizacion').value != null &&
      this.registrarAuto.get('gauFechaVencAutorizacion').value != null) {
      const days = this.registrarAuto.get('gauFechaVencAutorizacion').value
        .diff(this.registrarAuto.get('gauFechaAutorizacion').value, 'days');
      if (days <= 120) {
        this.registrarAuto.get('gauVigenciaAutorizacion').setValue(days);
        this.validDates = true;
      } else {
        this.validDates = false;
        this.registrarAuto.get('gauVigenciaAutorizacion').setValue(null);
        swal({
          title: 'Error',
          text: 'La vigencia debe ser máximo 120 días',
          icon: 'warning',
        });
      }
    }
  }

  limpiar() {
    this.ngOnInit();
  }

  close() {
    this.bloqueoService.unLockAll();
    this.dialogRef.close();
  }

  openDialogInfoConvenio(): void {
    const dialogRef = this.dialog.open(InfoConvenioComponent, {
      data: {
        myVar: { 'data': this.data.datoCita }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  selectionChangeAutoriza(matSelectChange: MatSelectChange) {
    this.registrarAuto.get('gauFechaAutorizacion').setValue(null);
    this.registrarAuto.get('gauFechaVencAutorizacion').setValue(null);
    this.registrarAuto.get('gauVigenciaAutorizacion').setValue(null);
    this.registrarAuto.get('gauCostoConvenio').setValue(0);
    this.registrarAuto.get('gauCostoPac').setValue(0);
    this.registrarAuto.get('gauCodigoAutorizacion').setValue(null);

    this.registrarAuto.get('gauFechaAutorizacion').enable();
    this.registrarAuto.get('gauFechaVencAutorizacion').enable();
    this.registrarAuto.get('gauVigenciaAutorizacion').enable();
    this.registrarAuto.get('gauCostoConvenio').enable();
    this.registrarAuto.get('gauCostoPac').enable();
    this.registrarAuto.get('gauCodigoAutorizacion').enable();
    this.registrarAuto.get('gauCostoPac').enable();


    if (matSelectChange.value === '1') {
      this.registrarAuto.get('gauFechaAutorizacion').enable();
      this.registrarAuto.get('gauFechaVencAutorizacion').enable();
      this.registrarAuto.get('mnaIdcodigo').setValue(null);
      this.registrarAuto.get('mnaIdcodigo').disable();
      this.registrarAuto.get('omnDesc').setValue(null);
      this.registrarAuto.get('omnDesc').disable();
    } else {
      this.registrarAuto.get('gauFechaAutorizacion').disable();
      this.registrarAuto.get('gauFechaVencAutorizacion').disable();
    }

    if (matSelectChange.value === '2') {
      this.registrarAuto.get('mnaIdcodigo').setValue(null);
      this.registrarAuto.get('mnaIdcodigo').enable();
      this.registrarAuto.get('omnDesc').setValue(null);
      this.registrarAuto.get('omnDesc').enable();

      this.registrarAuto.get('gauFechaAutorizacion').disable();
      this.registrarAuto.get('gauFechaVencAutorizacion').disable();
      this.registrarAuto.get('gauVigenciaAutorizacion').disable();
      this.registrarAuto.get('gauCostoConvenio').disable();
      this.registrarAuto.get('gauCostoPac').disable();
      this.registrarAuto.get('gauCodigoAutorizacion').disable();
    }

    if (matSelectChange.value === '3') {
      this.registrarAuto.get('mnaIdcodigo').setValue(null);
      this.registrarAuto.get('mnaIdcodigo').disable();
      this.registrarAuto.get('omnDesc').setValue(null);
      this.registrarAuto.get('omnDesc').disable();

      this.registrarAuto.get('gauFechaAutorizacion').disable();
      this.registrarAuto.get('gauFechaVencAutorizacion').disable();
      this.registrarAuto.get('gauVigenciaAutorizacion').disable();
      this.registrarAuto.get('gauCostoConvenio').disable();
      this.registrarAuto.get('gauCostoPac').disable();
      this.registrarAuto.get('gauCodigoAutorizacion').disable();
    }
  }

  selectionChangemotivoNo(matSelectChange: MatSelectChange) {
    if (matSelectChange.value !== '4') {
      this.registrarAuto.get('omnDesc').disable();
      this.registrarAuto.get('omnDesc').setValue(null);
    } else {
      this.registrarAuto.get('omnDesc').enable();
    }
  }

  validateRequiredNumeroAut(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '1') {
      if (group.get('gauCodigoAutorizacion').value === null || group.get('gauCodigoAutorizacion').value.trim() === '') {
        return { requiredAut: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredMotivoAutoriza(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '2') {
      if (group.get('mnaIdcodigo').value === null || group.get('mnaIdcodigo').value.trim() === '') {
        return { requiredMotivo: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredFechaAutorizacion(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '1') {
      if (group.get('gauFechaAutorizacion').value === null) {
        return { requiredFechaAut: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredFechaVencimiento(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '1') {
      if (group.get('gauFechaVencAutorizacion').value === null) {
        return { requiredFechaVencimiento: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredObservaciones(group: FormGroup) {
    if (group.get('gauObservaciones').value === null || group.get('gauObservaciones').value.trim() === '') {
      return { requiredObservacion: true };
    } else {
      return null;
    }
  }

  validateRequiredPoliza(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (group.get('numeroPoliza').value === null || group.get('numeroPoliza').value === '') {
      return { requiredPoliza: true };
    } else {
      return null;
    }
  }

  validateRequiredCostoConvenio(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '1') {
      if (group.get('gauCostoConvenio').value === null || group.get('gauCostoConvenio').value === '') {
        return { requiredCostoConvenio: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredCostoPaciente(group: FormGroup) {
    const autorizar = group.get('gauAutorizaServ').value; // to get value in input tag
    if (autorizar === '1') {
      if (group.get('gauCostoPac').value === null || group.get('gauCostoPac').value === '') {
        return { requiredCostoPaciente: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  validateRequiredOtroMotivo(group: FormGroup) {
    const otro = group.get('mnaIdcodigo').value; // to get value in input tag
    if (otro === '4') {
      if (group.get('omnDesc').value === null || group.get('omnDesc').value === '') {
        return { requiredOtroMotivo: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }


  setFormRegistra() {
    this.registrarAuto = this.fb.group({
      gauNombreAutorizador: ['',
      [Validators.required]],
      gauTelefonoAutorizador: ['', [
        Validators.required, Validators.pattern(/^(?!.*(.)\1{4})/), Validators.minLength(7), Validators.maxLength(20)
      ]],
      gauAutorizaServ: ['', [Validators.required]],
 //   gauNombreAutorizador: ['', [Validators.required]],
      mnaIdcodigo: [{ value: null, disabled: true }],
      omnDesc: [null, [
        Validators.minLength(7), Validators.maxLength(50)
      ]],
      gauCodigoAutorizacion: [{ value: null, disabled: true }, [
        Validators.minLength(3)
      ]],
      numeroPoliza: [''],
      gauFechaAutorizacion: [{ disabled: true, value: null }],
      gauFechaVencAutorizacion: [{ disabled: true, value: null }],
      gauVigenciaAutorizacion: [{ disabled: true, value: null }],
      gauValorPrestacion: [null, [Validators.required, Validators.min(0), Validators.maxLength(17), Validators.pattern('\\d*')]],
      gauCostoConvenio: [{ value: '0', disabled: true }, [Validators.min(0), Validators.maxLength(12), Validators.pattern(/^(?!.*(.)\1{4})/)]],
      gauCostoPac: [{ value: '0', disabled: true }, [Validators.min(0), Validators.maxLength(10), Validators.pattern(/^(?!.*(.)\1{4})/)]],
      gauObservaciones: [null, [
        Validators.minLength(7), Validators.maxLength(250), /* Validators.pattern(/^(?!.*(.)\1{3})/) */
      ]],
      enviarCorreo: [true]
    });
    this.registrarAuto.setValidators(
      [
        this.validateRequiredNumeroAut,
        this.validateRequiredMotivoAutoriza,
        this.validateRequiredFechaAutorizacion,
        this.validateRequiredFechaVencimiento,
        this.validateRequiredObservaciones,
        this.validateRequiredOtroMotivo,
        this.validateRequiredCostoConvenio,
        this.validateRequiredCostoPaciente
      ]);
    this.registrarAuto.get('omnDesc').setValue(null);
    this.registrarAuto.get('omnDesc').disable();
  }

  setEstado() {
    if (this.data.datoCita.codEstadoCita != undefined && this.data.datoCita.codEstadoCita !== null && this.data.datoCita.codEstadoCita.trim() !== '' &&
      this.data.datoCita.codEstadoCita.trim() === '3') {
      // consultamos el servicio de consulta de la gestion de la autorizacion
      this.gestionAutorizacionService.
        getGestionAutorizacionPorPacNumero(this.data.datoCita.idCita).
        subscribe((gestionAut: GestionAutorizacionCita) => {
          this.registrarAuto.get('gauTelefonoAutorizador').setValue(parseInt(gestionAut.gauTelefonoAutorizador));
          this.registrarAuto.get('gauAutorizaServ').setValue(gestionAut.gauAutorizaServ);
          this.registrarAuto.get('gauNombreAutorizador').setValue(gestionAut.gauNombreAutorizador);
          this.registrarAuto.get('gauObservaciones').setValue(gestionAut.ogaDescripcion);
        });
    }
  }


  setEstadoPrestacion() {
    if (this.data.datoCita.module !== undefined && this.data.datoCita.module !== null &&
      this.data.datoCita.module === 'derivacion') {
      const caAutorizacion = this.caPrestacionesOrdMed.caGestionAutorizacion;
      if (caAutorizacion !== undefined && caAutorizacion !== null) {
        this.registrarAuto.get('gauTelefonoAutorizador').setValue(parseInt(caAutorizacion.gauTelefonoAutorizador));
        this.registrarAuto.get('gauAutorizaServ').setValue(caAutorizacion.gauAutorizaServ);
        this.registrarAuto.get('gauNombreAutorizador').setValue(caAutorizacion.gauNombreAutorizador);
        this.registrarAuto.get('gauObservaciones').setValue(caAutorizacion.ogaDescripcion);
      }
      this.prestacion = this.data.datoCita;
    }
  }

  getState(state: number) {
    switch (state) {
      case 1: return 'PRE-RADICADA';
      case 2: return 'REGISTRADA';
      case 3: return 'RADICADA';
      case 4: return 'AUTORIZADA';
      case 5: return 'AGENDADA';
      default: return '';
    }
  }


}

/** Error when the parent is invalid */
export class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        control.hasError('maxlength') ||
        control.hasError('pattern') ||
        form.hasError('requiredAut'));
  }
}

export class CrossFieldErrorMatcherNumeroPoliza implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        form.hasError('requiredPoliza'));
  }
}

export class CrossFieldErrorMatcherCostoConvenio implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        control.hasError('maxlength') ||
        control.hasError('pattern') ||
        form.hasError('requiredCostoConvenio'));
  }
}

export class CrossFieldErrorMatcherCostoPaciente implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        control.hasError('maxlength') ||
        control.hasError('pattern') ||
        form.hasError('requiredCostoPaciente'));
  }
}

export class CrossFieldErrorMatcherOtroMotivo implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        control.hasError('maxlength') ||
        control.hasError('pattern') ||
        form.hasError('requiredOtroMotivo'));
  }
}

export class CrossFieldErrorMatcherMotivo implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched && form.hasError('requiredMotivo');
  }
}

export class CrossFieldErrorMatcherFechaAut implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched && form.hasError('requiredFechaAut');
  }
}

export class CrossFieldErrorMatcherFechaVencimiento implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched && form.hasError('requiredFechaVencimiento');
  }
}

export class CrossFieldErrorMatcherObservaciones implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched &&
      (control.hasError('minlength') ||
        control.hasError('maxlength') ||
        control.hasError('pattern') ||
        form.hasError('requiredObservacion'));
  }
}
