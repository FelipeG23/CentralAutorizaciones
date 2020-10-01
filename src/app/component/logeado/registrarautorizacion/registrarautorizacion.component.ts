import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS} from '@angular/material';
import { CaGestionAutorizacion } from 'src/app/models/orden-medica/CaGestionAutorizacion';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import * as moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';

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
  selector: 'app-registrarautorizacion',
  templateUrl: './registrarautorizacion.component.html',
  styleUrls: ['./registrarautorizacion.component.less'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-US'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class RegistrarautorizacionComponent implements OnInit {
  registrarAuto: FormGroup;
  date = new Date();
  minDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  maxDateAuto = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
  resultado: any;
  validDates = false;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<RegistrarautorizacionComponent>,
    public ordenService: OrdenService,
    public spinnerService: NgxSpinnerService,
    public authenticatedService: AuthenticatedService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.registrarAuto = this.fb.group({
      gauNombreAutorizador: ['', [
          Validators.maxLength(50)
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

  onSubmit() {
    const caGestionarAutorizacion: CaGestionAutorizacion = Object.assign(new CaGestionAutorizacion, this.registrarAuto.getRawValue());    
    if (caGestionarAutorizacion.gauAutorizaServ !== '2') {
      caGestionarAutorizacion.mnaIdcodigo = null;
      caGestionarAutorizacion.omnDesc = null;
    }
    caGestionarAutorizacion.pomIdPrestOrdm = this.data.pomIdPrestOrdm;
    caGestionarAutorizacion.pacPacNumero = this.data.pacPacNumero;
    caGestionarAutorizacion.pcaAgeCodigoRecep = this.authenticatedService.getUser().uid;
    this.spinnerService.show();
    this.ordenService.registrarAutorizacion(caGestionarAutorizacion).subscribe(
      (data: boolean) => {
        this.spinnerService.hide();
        if (data) {
          swal({
            title: 'Proceso exitoso',
            text: 'Datos actualizados!',
            icon: 'success',
          });
          this.dialogRef.close(caGestionarAutorizacion);
        } else {
          swal({
            title: 'Error',
            text: 'Error registrando la autorización, por favor intente nuevamente',
            icon: 'warning',
          });
        }
      }, err => {
        this.spinnerService.hide();
        swal({
          title: 'Error',
          text: 'Error registrando la autorización, por favor intente nuevamente',
          icon: 'warning',
        });
      });
  }

  updateCalcs() {
    if (this.registrarAuto.get("gauFechaAutorizacion").value != null && this.registrarAuto.get("gauFechaVencAutorizacion").value != null) {
      const days = this.registrarAuto.get("gauFechaVencAutorizacion").value
          .diff(this.registrarAuto.get("gauFechaAutorizacion").value,'days');
      console.log(days);
      

      if (days <= 120) {
        this.registrarAuto.get("gauVigenciaAutorizacion").setValue(days);
        this.validDates = true;
      } else {
        this.validDates = false;
        this.registrarAuto.get("gauVigenciaAutorizacion").setValue(null);
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

  close(){
    this.dialogRef.close();
  }
}
