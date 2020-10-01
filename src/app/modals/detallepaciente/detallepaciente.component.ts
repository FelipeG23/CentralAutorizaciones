import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DetalleCitaService } from 'src/app/service/citas/detalle-cita.service';
import {AbstractControl, ValidatorFn} from '@angular/forms';

@Component({
  selector: 'app-detallepaciente',
  templateUrl: './detallepaciente.component.html',
  styleUrls: ['./detallepaciente.component.less']
})
export class DetallepacienteComponent implements OnInit {
  detalle: any;

  constructor(private detalleCitaService: DetalleCitaService,
              public dialogRef: MatDialogRef<DetallepacienteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
                this.detalle = data;
              }

  ngOnInit() {
    //this.detalleCitaService.getDetalleCita(this.detalle).subscribe(data => console.log(data));
  }

  close() {
    this.dialogRef.close();
  }
}
