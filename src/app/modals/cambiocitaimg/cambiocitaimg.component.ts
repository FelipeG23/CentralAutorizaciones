import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatSelectChange, ErrorStateMatcher } from '@angular/material';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidatorFn, Validators } from '@angular/forms';
import swal from 'sweetalert';
import { InfoConvenioComponent } from '../info-convenio/info-convenio.component';
import { EnvioCorreoService } from 'src/app/service/citas/envio-correo.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DetallepacienteComponent } from '../detallepaciente/detallepaciente.component';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';
import { DetalleCitaService } from 'src/app/service/citas/detalle-cita.service';
import { CaPolizasPaciente } from 'src/app/models/caPolizasPaciente';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MotivoNoAutorizaService } from 'src/app/service/catalogos/motivoNoAutoriza.service';
import { ConsultaService } from 'src/app/service/citas/consulta.service';
import { GestionAutorizacionService } from 'src/app/service/citas/gestion-autorizacion.service';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { DetalleCita } from 'src/app/models/detalle-cita';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { CaGestionAutorizacionCita } from 'src/app/models/orden-medica/CaGestionAutorizacionCita';
import { GestionAutorizacionCita } from 'src/app/models/gestionAutorizacion';
import { NullInjector } from '@angular/core/src/di/injector';

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
  selector: 'app-cambiocitaimg',
  templateUrl: './cambiocitaimg.component.html',
  styleUrls: ['./cambiocitaimg.component.less'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-US' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CambiocitaImgComponent implements OnInit {
  cambioCitas: FormGroup;
  datosCambio: any;
  panelOpenState = false;
  
  date = new Date();
  maxDateAuto = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
  resultado: any;
  validDates = false;
  valorCuota: boolean;
  minDate = new Date(this.date.getFullYear(), 0, 1);
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
  numeroPolizaReadonly = true;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<CambiocitaImgComponent>,
    private spinnerService: NgxSpinnerService,
    public authenticatedService: AuthenticatedService,
    private firestore: AngularFirestore,
    private cookie: CookieService,
    public dialog: MatDialog,
    private gestionAutorizacionService: GestionAutorizacionService,
    private ordenService: OrdenService,
    private consultarOrdenService: ConsultarordenService,
    private bloqueoService: BloqueoService,
    private consultaService: ConsultaService,
    private motivoNoAutorizaService: MotivoNoAutorizaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private detalleCitaService: DetalleCitaService) {
    this.datosCambio = data;
  }
  
  ngOnInit() {

    this.cambioCitas = this.fb.group({
      gauNombreAutorizador: ['', [ 
        Validators.required
      ]],
      gauTelefonoAutorizador: ['', [
          Validators.required, Validators.minLength(7), Validators.maxLength(20)
      ]],
      gauAutorizaServ: ['', [Validators.required]],
      mnaIdcodigo: [null],
      omnDesc: [null, [
          Validators.minLength(7), Validators.maxLength(50)
      ]],
      gauCodigoAutorizacion: ['', [
        Validators.required, Validators.minLength(3)
      ]],
      numeroPoliza: ['', [Validators.minLength(3)]],
      gauFechaAutorizacion: [{disabled: true, value: null}, [Validators.required]],
      gauFechaVencAutorizacion: [{disabled: true, value: null}, [Validators.required]],
      gauVigenciaAutorizacion: [{disabled: true, value: null}, [Validators.required]],
      gauValorPrestacion: ['0', [Validators.required, Validators.min(0), Validators.maxLength(17), Validators.pattern("\\d*")]],
      gauCostoConvenio: ['0', [Validators.required, Validators.min(0), Validators.maxLength(10), Validators.pattern("\\d*")]],
      gauCostoPac: ['0', [Validators.required, Validators.min(0), Validators.maxLength(10), Validators.pattern("\\d*")]],
      gauObservaciones: [null, [
        Validators.required, Validators.minLength(7), Validators.maxLength(600), Validators.pattern(/^(?!.*(.)\1{3})/)
      ]],
      enviarCorreo: [true] 
    });
  }

  camino() {
    if (this.cambioCitas.value.gauAutorizaServ === 1) {
      this.caminoRegistroSi = true;
    } else {
      this.caminoRegistroNo = true;
    }
  }

  onSubmit() {    
    if (this.data.datoCita == 'derivacion') {
      console.log("Datos Diego");
      const caGestionAutorizacion: CaGestionAutorizacion = Object.assign(new CaGestionAutorizacion(), this.cambioCitas.value);
      if (caGestionAutorizacion.gauAutorizaServ !== '2') {
        caGestionAutorizacion.mnaIdcodigo = null;
        caGestionAutorizacion.omnDesc = null;
        console.log('entra en 1');
      }  
      console.log('entra en 2');
      caGestionAutorizacion.pomIdPrestOrdm = this.data.datoCita.pomIdPrestOrdm;
      caGestionAutorizacion.pacPacNumero = this.data.datoCita.ordenMedica.pacPacNumero;
      caGestionAutorizacion.gauVigenciaAutorizacion = this.cambioCitas.get('gauVigenciaAutorizacion').value;
      caGestionAutorizacion.pcaAgeCodigoRecep = this.authenticatedService.getUser().uid;
      console.log('mouse ' , caGestionAutorizacion.pcaAgeCodigoRecep);
      caGestionAutorizacion.nombrePaciente = this.data.datoCita.ordenMedica.nombreCompletoPaciente;
      caGestionAutorizacion.centroAtencion = this.data.datoCita.sedes[0].descripcion;
      this.spinnerService.show();
      /*
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
       */ 

    } else {
      console.log('entra en 3');

      
      const caGestionAutorizacionCita: CaGestionAutorizacionCita = Object.assign(new CaGestionAutorizacionCita(), this.cambioCitas.value);
    
      if (caGestionAutorizacionCita.gauAutorizaServ !== '2') {
        caGestionAutorizacionCita.mnaIdcodigo = null;
        caGestionAutorizacionCita.omnDesc = null;
        console.log('entra en 4');

      }  
      console.log('entra en 5');

      caGestionAutorizacionCita.fechaCita = "2020/03/02";
      caGestionAutorizacionCita.horaCita = "07:40";
      caGestionAutorizacionCita.codUsrCita = this.data.myVar.data.IDENTIFICACION;
      caGestionAutorizacionCita.pacNum = 12345;
      caGestionAutorizacionCita.gauVigenciaAutorizacion = this.cambioCitas.get('gauVigenciaAutorizacion').value;
      caGestionAutorizacionCita.nombrePaciente =`${this.data.myVar.data.NOMBRES} ${this.data.myVar.data.APELLIDOS}`;
      caGestionAutorizacionCita.centroAtencion = this.data.myVar.data.SERVICIO;
      caGestionAutorizacionCita.pcaAgeCodigoRecep = this.authenticatedService.getUser().uid; 
      console.log('Prueba ' ,this.authenticatedService.getUser());
      console.log("prueba 2",this.data.myVar.data.SERVICIO);//daniela
      console.log("Test",this.data.myVar);
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
          //const messageError: any = err.error.error.message;
          this.spinnerService.hide();
          this.bloqueoService.unLockAll();
          swal({
            title: 'Error',
            text: "messageError",
            icon: 'warning',
          });
        });  
    } 
  }


  updateCalcs() {
    console.log('entra en 6');

    if (this.cambioCitas.get('gauFechaAutorizacion').value != null &&
      this.cambioCitas.get('gauFechaVencAutorizacion').value != null) {
      const days = this.cambioCitas.get('gauFechaVencAutorizacion').value
        .diff(this.cambioCitas.get('gauFechaAutorizacion').value, 'days');
      if (days <= 120) {
        this.cambioCitas.get('gauVigenciaAutorizacion').setValue(days);
        this.validDates = true;
      } else {
        this.validDates = false;
        this.cambioCitas.get('gauVigenciaAutorizacion').setValue(null);
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
        myVar: { 'data': this.cambioCitas }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  selectionChangeAutoriza(matSelectChange: MatSelectChange) {
    console.log('entra en 7');

    this.cambioCitas.get('gauFechaAutorizacion').setValue(null);
    this.cambioCitas.get('gauFechaVencAutorizacion').setValue(null);
    this.cambioCitas.get('gauVigenciaAutorizacion').setValue(null);
    this.cambioCitas.get('gauCostoConvenio').setValue(0);
    this.cambioCitas.get('gauCostoPac').setValue(0);
    this.cambioCitas.get('gauCodigoAutorizacion').setValue(null);

    this.cambioCitas.get('gauFechaAutorizacion').enable();
    this.cambioCitas.get('gauFechaVencAutorizacion').enable();
    this.cambioCitas.get('gauVigenciaAutorizacion').enable();
    this.cambioCitas.get('gauCostoConvenio').enable();
    this.cambioCitas.get('gauCostoPac').enable();
    this.cambioCitas.get('gauCodigoAutorizacion').enable();
    this.cambioCitas.get('gauCostoPac').enable();


    if (matSelectChange.value === '1') {
      this.cambioCitas.get('gauFechaAutorizacion').enable();
      this.cambioCitas.get('gauFechaVencAutorizacion').enable();
      this.cambioCitas.get('mnaIdcodigo').setValue(null);
      this.cambioCitas.get('mnaIdcodigo').disable();
      this.cambioCitas.get('omnDesc').setValue(null);
      this.cambioCitas.get('omnDesc').disable();
    } else {
      this.cambioCitas.get('gauFechaAutorizacion').disable();
      this.cambioCitas.get('gauFechaVencAutorizacion').disable();
    }

    if (matSelectChange.value === '2') {
      this.cambioCitas.get('mnaIdcodigo').setValue(null);
      this.cambioCitas.get('mnaIdcodigo').enable();
      this.cambioCitas.get('omnDesc').setValue(null);
      this.cambioCitas.get('omnDesc').enable();

      this.cambioCitas.get('gauFechaAutorizacion').disable();
      this.cambioCitas.get('gauFechaVencAutorizacion').disable();
      this.cambioCitas.get('gauVigenciaAutorizacion').disable();
      this.cambioCitas.get('gauCostoConvenio').disable();
      this.cambioCitas.get('gauCostoPac').disable();
      this.cambioCitas.get('gauCodigoAutorizacion').disable();
    }

    if (matSelectChange.value === '3') {
      this.cambioCitas.get('mnaIdcodigo').setValue(null);
      this.cambioCitas.get('mnaIdcodigo').disable();
      this.cambioCitas.get('omnDesc').setValue(null);
      this.cambioCitas.get('omnDesc').disable();

      this.cambioCitas.get('gauFechaAutorizacion').disable();
      this.cambioCitas.get('gauFechaVencAutorizacion').disable();
      this.cambioCitas.get('gauVigenciaAutorizacion').disable();
      this.cambioCitas.get('gauCostoConvenio').disable();
      this.cambioCitas.get('gauCostoPac').disable();
      this.cambioCitas.get('gauCodigoAutorizacion').disable();
    }
  }

  selectionChangemotivoNo(matSelectChange: MatSelectChange) {
    if (matSelectChange.value !== '4') {
      this.cambioCitas.get('omnDesc').disable();
      this.cambioCitas.get('omnDesc').setValue(null);
    } else {
      this.cambioCitas.get('omnDesc').enable();
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
    this.cambioCitas = this.fb.group({
      gauNombreAutorizador: [''
      ],
      gauTelefonoAutorizador: [''],
      gauAutorizaServ: [''],
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
      gauValorPrestacion: [null],
      gauCostoConvenio: [{ value: '0', disabled: true }, [Validators.min(0), Validators.maxLength(12), Validators.pattern(/^(?!.*(.)\1{4})/)]],
      gauCostoPac: [{ value: '0', disabled: true }, [Validators.min(0), Validators.maxLength(10), Validators.pattern(/^(?!.*(.)\1{4})/)]],
      gauObservaciones: [null, [
        Validators.minLength(7), Validators.maxLength(250), /* Validators.pattern(/^(?!.*(.)\1{3})/) */
      ]],
      enviarCorreo: [true]
    });
    this.cambioCitas.setValidators(
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
    this.cambioCitas.get('omnDesc').setValue(null);
    this.cambioCitas.get('omnDesc').disable();
  }

  /*
  setEstado() {
    if (this.data.datoCita.codEstadoCita != undefined && this.data.datoCita.codEstadoCita !== null && this.data.datoCita.codEstadoCita.trim() !== '' &&
      this.data.datoCita.codEstadoCita.trim() === '3') {
      // consultamos el servicio de consulta de la gestion de la autorizacion
      this.gestionAutorizacionService.
        getGestionAutorizacionPorPacNumero(this.data.datoCita.idCita).
        subscribe((gestionAut: GestionAutorizacionCita) => {
          this.cambioCitas.get('gauTelefonoAutorizador').setValue(parseInt(gestionAut.gauTelefonoAutorizador));
          this.cambioCitas.get('gauAutorizaServ').setValue(gestionAut.gauAutorizaServ);
          this.cambioCitas.get('gauNombreAutorizador').setValue(gestionAut.gauNombreAutorizador);
          this.cambioCitas.get('gauObservaciones').setValue(gestionAut.ogaDescripcion);
        });
    }
  }
  */

/*
  setEstadoPrestacion() {
    if (this.data.datoCita.module !== undefined && this.data.datoCita.module !== null &&
      this.data.datoCita.module === 'derivacion') {
      const caAutorizacion = this.caPrestacionesOrdMed.caGestionAutorizacion;
      if (caAutorizacion !== undefined && caAutorizacion !== null) {
        this.cambioCitas.get('gauTelefonoAutorizador').setValue(parseInt(caAutorizacion.gauTelefonoAutorizador));
        this.cambioCitas.get('gauAutorizaServ').setValue(caAutorizacion.gauAutorizaServ);
        this.cambioCitas.get('gauNombreAutorizador').setValue(caAutorizacion.gauNombreAutorizador);
        this.cambioCitas.get('gauObservaciones').setValue(caAutorizacion.ogaDescripcion);
      }
      this.prestacion = this.data.datoCita;
    }
  }  */

/*
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
*/


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