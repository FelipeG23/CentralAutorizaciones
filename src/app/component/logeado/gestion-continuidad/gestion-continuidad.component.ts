import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GestionContinuidadService } from 'src/app/service/citas/gestioncontinuidad.service';
import { RespuestaGestionContinuidad } from 'src/app/models/gestion-continuidad/RespuestaGestionContinuidad';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { GestionContinuidad } from 'src/app/models/gestion-continuidad/GestionContinuidad';

@Component({
  selector: 'app-gestion-continuidad',
  templateUrl: './gestion-continuidad.component.html',
  styleUrls: ['./gestion-continuidad.component.less']
})
export class GestionContinuidadComponent implements OnInit {
  continuidad: FormGroup;
  gestionContinuidad: GestionContinuidad;

  constructor(private fb: FormBuilder,
    public gestionContinuidadService: GestionContinuidadService,
    public dialogRef: MatDialogRef<GestionContinuidadComponent>,
    public spinnerService:NgxSpinnerService,
    public authenticatedService:AuthenticatedService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.continuidad = this.fb.group({
      gcoIdCodigoEstado: [null, [Validators.required]],
      gcoDirecPaciente: [false, [Validators.required]],
      gcoRealizoAgendamiento: [false, [Validators.required]],
      gcoIdCodigoMotivo: [null],
      gcoObservaciones: [null],
      enviarCorreo: [true, [Validators.required]]
    })
  }

  onSubmit() {
    this.gestionContinuidad = Object.assign(new GestionContinuidad(), this.continuidad.value);
    if(this.gestionContinuidad.gcoIdCodigoEstado != '2'){
      this.gestionContinuidad.gcoIdCodigoMotivo = null;
    }
    this.gestionContinuidad.pomIdPrestOrdm = this.data.pomIdPrestOrdm;
    this.gestionContinuidad.pcaAgeCodigRecep = this.authenticatedService.getUser().uid;
    this.spinnerService.show();
    this.gestionContinuidadService.createGestionContinuidad(this.gestionContinuidad).subscribe(
      (data: RespuestaGestionContinuidad) => {
        this.spinnerService.hide();
        if(data.success){
            swal({
              title: 'Proceso exitoso!',
              text: data.respMensaje,
              icon: 'success',
            });
            this.dialogRef.close(this.gestionContinuidad);
        }else{
          swal({
            title: 'Error',
            text: data.respMensaje,
            icon: 'warning',
          });
        }
      }, err => {
        this.spinnerService.hide();
        swal({
          title: 'Error',
          text: 'La solicitud no pudo ser completada, por favor consulte a soporte',
          icon: 'warning',
        });
      }
    );

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

  close(){
    this.dialogRef.close();
  }
}
