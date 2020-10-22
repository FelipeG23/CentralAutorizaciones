import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import swal from 'sweetalert';
import { TrazabilidadService } from 'src/app/service/citas/trazabilidad.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-traza',
  templateUrl: './traza.component.html',
  styleUrls: ['./traza.component.less']
})
export class TrazaComponent implements OnInit {
  displayedColumns: string[] = ['cgFechaProceso', 'cgHoraProceso', 'cauDescUsuarios', 'ecDescripcion', 'ecEstado'];
  dataSource;
  trazadata: any;
  fechaAsignada: string;

  constructor(private fb: FormBuilder,
    private trazabilidadService: TrazabilidadService,
    public spinnerService: NgxSpinnerService,
    public dialogRef: MatDialogRef<TrazaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.trazadata = data;
    }

  ngOnInit() {
    this.spinnerService.show();
    this.trazabilidadService.getTraza(this.trazadata).subscribe(
      data => {
        this.spinnerService.hide();
        this.dataSource = data;
        console.log(this.dataSource);

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
