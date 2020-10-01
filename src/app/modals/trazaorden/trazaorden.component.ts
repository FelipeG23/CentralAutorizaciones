import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import swal from 'sweetalert';
import { TrazabilidadService } from 'src/app/service/citas/trazabilidad.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-trazaorden',
  templateUrl: './trazaorden.component.html',
  styleUrls: ['./trazaorden.component.less']
})
export class TrazaOrdenComponent implements OnInit {
  displayedColumns: string[] = ['cgFechaProceso', 'cgHoraProceso', 'cauDescUsuarios', 'ecDescripcion'];
  dataSource;
  trazadata: any;
  fechaAsignada: string;

  constructor(private fb: FormBuilder,
    private trazabilidadService: TrazabilidadService,
    public spinnerService:NgxSpinnerService,
    public dialogRef: MatDialogRef<TrazaOrdenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.trazadata = data;
    }

  ngOnInit() {
    this.spinnerService.show();
    this.trazabilidadService.getTrazaOrden(this.trazadata).subscribe(
      data => {
        this.spinnerService.hide();
        this.dataSource = data;
      },
      error => {
        console.log(error);
        this.spinnerService.hide();
        swal({
          text: 'No pudo cargar la traza de la cita!',
          icon: 'warning',
        });
      });
  }

  close() {
    this.dialogRef.close();
  }
}
