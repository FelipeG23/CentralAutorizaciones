import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import swal from 'sweetalert';
import { TrazabilidadService } from 'src/app/service/citas/trazabilidad.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { OrdenMedica } from 'src/app/models/orden-medica/OrdenMedica';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { GestionContinuidad } from 'src/app/models/gestion-continuidad/GestionContinuidad';
import { GestionContinuidadService } from 'src/app/service/citas/gestioncontinuidad.service';
import { RespuestaGestionContinuidad } from 'src/app/models/gestion-continuidad/RespuestaGestionContinuidad';
import { AuthenticatedService } from 'src/app/service/user/authenticated.service';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { BloqueoService } from '../../service/firebase/bloqueo.service';

@Component({
  selector: 'app-ver-radicar',
  templateUrl: './ver-radicar.component.html',
  styleUrls: ['./ver-radicar.component.scss']
})
export class VerRadicarComponent implements OnInit {
  ordenMedica: OrdenMedica;
  verCard: boolean;
  continuidad: FormGroup;
  gestionContinuidad: GestionContinuidad;
  idPres: any;
  nombreCompleto: any;
  tipoDoc: string;
  numeroDoc: string;
  elegirPrestacion: boolean;


  constructor(private fb: FormBuilder,
    public spinnerService: NgxSpinnerService,
    private ordenService: OrdenService,
    public authenticatedService: AuthenticatedService,
    public gestionContinuidadService: GestionContinuidadService,
    private bloqueoService: BloqueoService,
    public dialogRef: MatDialogRef<VerRadicarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.elegirPrestacion = false;
    this.continuidad = this.fb.group({
      gcoIdCodigoEstado: [null, [Validators.required]],
      gcoDirecPaciente: [false, [Validators.required]],
      gcoRealizoAgendamiento: [false, [Validators.required]],
      gcoIdCodigoMotivo: [null],
      gcoObservaciones: [null],
      enviarCorreo: [true, [Validators.required]]
    })
    this.spinnerService.show();
    const id = JSON.parse(localStorage.getItem('orden'));
    this.ordenService.getDetailOrden(id).subscribe((data: OrdenMedica) => {
      this.spinnerService.hide();
      this.ordenMedica = data;
      this.nombreCompleto = this.ordenMedica.nombreCompletoPaciente;
      this.tipoDoc = this.ordenMedica.tipTipIDav;
      this.numeroDoc = this.ordenMedica.pacPacRut;
      if (this.ordenMedica.caPrestacionesOrdMed.length > 0) {
        this.verCard = true;
        let caPrestacionesOrdMed = this.ordenMedica.caPrestacionesOrdMed;
        caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caP: CaPrestacionesOrdMed) => {
          const v = caP.caTrazaGestContinuidad == null || caP.caTrazaGestContinuidad.gcoIdCodigoEstado <= 0;
          return v;
        });
        if (caPrestacionesOrdMed.length === 0) {
          swal({
            title: 'Gestión de continuidad completa!',
            text: 'Este paciente ya completó la gestión de continuidad!',
            icon: 'info',
          });
          this.close();
          this.unlock();
          return;
        }
        this.ordenMedica.caPrestacionesOrdMed = caPrestacionesOrdMed;
      } else {
        this.close();
        this.unlock();
        swal({
          title: 'No se encontraron datos relacionados!',
          text: 'Este paciente no contiene registros asociados!',
          icon: 'info',
        });
      }
    }, err => {
      this.spinnerService.hide();
      this.close();
      this.unlock();
    });
  }

  onSubmit() {
    this.gestionContinuidad = Object.assign(new GestionContinuidad(), this.continuidad.value);
    if (this.gestionContinuidad.gcoIdCodigoEstado != '2') {
      this.gestionContinuidad.gcoIdCodigoMotivo = null;
    }
    const prestacion = this.ordenMedica.caPrestacionesOrdMed.filter(v => v.pomIdPrestOrdm === this.idPres)[0];
    if (prestacion != undefined) {
      this.gestionContinuidad.pomIdPrestOrdm = this.idPres;
      this.gestionContinuidad.pcaAgeCodigRecep = this.authenticatedService.getUser().uid;
      this.gestionContinuidad.nombrePaciente = this.nombreCompleto.toString().split(' ')[0];
      this.gestionContinuidad.prePreDesc = prestacion.prePreDesc;
      this.gestionContinuidad.prePreCodigo = prestacion.prePreCodigo;
      this.gestionContinuidad.serSerCodigo = prestacion.serSerCodigo;
      this.gestionContinuidad.serSerDesc = prestacion.serSerDesc;
      this.spinnerService.show();
      this.gestionContinuidadService.createGestionContinuidad(this.gestionContinuidad).subscribe(
        (data: RespuestaGestionContinuidad) => {
          this.spinnerService.hide();
          if (data.success) {
            swal({
              title: 'Proceso exitoso!',
              text: data.respMensaje,
              icon: 'success',
            });
            // proceso exitoso gestion continuidad
            let caPrestacionesOrdMed = this.ordenMedica.caPrestacionesOrdMed;
            caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caP: CaPrestacionesOrdMed) => {
              const v = caP.pomIdPrestOrdm !== this.gestionContinuidad.pomIdPrestOrdm;
              return v;
            });

            if (caPrestacionesOrdMed.length === 0) {
              this.close();
              this.unlock();
              return;
            }

            this.ordenMedica.caPrestacionesOrdMed = caPrestacionesOrdMed;

            // this.dialogRef.close(this.gestionContinuidad);
          } else {
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

    }else{
      this.elegirPrestacion = true;
    }



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

  selectCard(prestacion) {
    this.idPres = prestacion.pomIdPrestOrdm
  }

  close() {
    this.dialogRef.close();
    this.unlock();
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

  unlock() {
    this.bloqueoService.unLockAll();
  }

}
