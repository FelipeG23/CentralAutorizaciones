import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import swal from 'sweetalert';
import { InfoConvenioComponent } from '../info-convenio/info-convenio.component';
import { CambiocitaimgService } from 'src/app/service/citas/cambiocitaimg.service';
import { EnvioCorreoimgService } from 'src/app/service/citas/envio-correoimg.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DetallepacienteComponent } from '../detallepaciente/detallepaciente.component';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';
import { DetalleCitaService } from 'src/app/service/citas/detalle-cita.service';
import { CaPolizasPaciente } from 'src/app/models/caPolizasPaciente';

@Component({
  selector: 'app-cambiocitaimg',
  templateUrl: './cambiocitaimg.component.html',
  styleUrls: ['./cambiocitaimg.component.less']
})
export class CambiocitaImgComponent implements OnInit {
  cambioCitas: FormGroup;
  datosCambio: any;
  panelOpenState = false;
  numeroPolizaReadonly = true;

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private cambiocitaService: CambiocitaimgService,
    private envioCorreoService: EnvioCorreoimgService,
    public spinnerService: NgxSpinnerService,
    private cookie: CookieService,
    private firestore: AngularFirestore,
    private bloqueoService: BloqueoService,
    public dialogRef: MatDialogRef<CambiocitaImgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private detalleCitaService: DetalleCitaService) {
    this.datosCambio = data;
  }

  ngOnInit() {
    console.log(this.datosCambio.myVar.data.tipoConvenio);
    this.cambioCitas = this.fb.group({
      tipoCita: ['', [Validators.required]],
      estado: ['', [Validators.required, this.checkState(this.datosCambio.myVar.data.estadoCita)]],
      detalleEstado: ['', [Validators.required]],
      observacion: ['', [Validators.maxLength(600), Validators.minLength(1),
      Validators.pattern(/^(?!.*(.)\1{3})/)]],
      numeroPoliza: [''],
      sendEmail: ['']
    });

    if (this.datosCambio.myVar.data.tipoConvenio === "A" || this.datosCambio.myVar.data.tipoConvenio === "S" ) {
      this.numeroPolizaReadonly = false;
      this.cambioCitas.controls['numeroPoliza'].setValidators([Validators.required]);
    } else {
      this.cambioCitas.controls['numeroPoliza'].setValidators([]);
    }



    // consultamos la poliza
    this.detalleCitaService.consultarPoliza(this.datosCambio.myVar.data.pacNum).
      subscribe((poliza: CaPolizasPaciente) => {
        if (poliza !== null) {
          this.cambioCitas.get('numeroPoliza').setValue(poliza.ecPolizaNumero);
        }
      })

  }

  onSubmit() {
    if (this.cambioCitas.valid) {
      this.spinnerService.show();
      this.cambiocitaService.changeAppointment(this.datosCambio, this.cambioCitas.value).subscribe(data => {
        this.spinnerService.hide();
        const est = this.getEstado(this.cambioCitas.value.estado);
        localStorage.setItem('trazaId', JSON.stringify(data));
        const id = JSON.parse(localStorage.getItem('trazaId'));
        this.enviarMail(id);
        swal({
          text: 'Datos actualizados!',
          icon: 'success',
        });
        this.dialogRef.close(est);
        // this.dialogRef.close('Vas a guardar?');
        this.firestore.doc('userInfo/' + this.cookie.get('free')).delete();
        clearInterval(parseInt(this.cookie.get('Intervalo')));
        clearInterval(parseInt(this.cookie.get('intervalTimeOut')));
      }, error => {
        this.spinnerService.hide();
        swal({
          text: 'No podemos procesar la información!',
          icon: 'warning',
        });
      }); 
    }
  }

  getEstado(value) {
    switch (value) {
      case "2": return "CONFIRMADA";
      case "4": return "CANCELADA POR PACIENTE";
      case "5": return "CANCELADA POR MEDICO";
      case "6": return "REPROGRAMADA";
    }
  }

  getCodeEstado(value) {
    switch (value) {
      case "CONFIRMADA": return "2";
      case "CANCELADA POR PACIENTE": return "4";
      case "CANCELADA POR MEDICO": return "5";
      case "REPROGRAMADA": return "6";
    }
  }

  enviarMail(id) {
    if (this.cambioCitas.valid) {
      this.envioCorreoService.sendMail(this.datosCambio, this.cambioCitas.value, id, this.getAsunto("this.cambioCitas.value.estado")).subscribe(
        data => {
          console.log(data);
        }, error => {
          console.log(error);
        });
    }
  }

  openDialogInfoConvenio(): void {
    const dialogRef = this.dialog.open(InfoConvenioComponent, {
      data: {
        myVar: { 'data': this.datosCambio }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  close() {
    this.bloqueoService.unLock('userInfo/');
    this.dialogRef.close();
  }

  private getAsunto(estado: any) {
    switch (estado) {
      case '2': return 'Fundación Santa Fe de Bogotá (Este es el estado de tu cita CONFIRMADA)';
      case '4': return 'Fundación Santa Fe de Bogotá (Este es el estado de tu cita CANCELADA)'; // Por paciente
      case '5': return 'Fundación Santa Fe de Bogotá (Este es el estado de tu cita CANCELADA)'; // Por medico
      case '6': return 'Notificación de reprogramación de cita';
    }
  }

  checkState(stateOld: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const newState = control.value;
      if (newState === this.getCodeEstado(stateOld)) {
        return { 'checkState': newState };
      }
      return null;
    };
  }

}
