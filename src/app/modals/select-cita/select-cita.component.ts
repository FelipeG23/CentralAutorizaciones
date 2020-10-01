import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-select-cita',
  templateUrl: './select-cita.component.html',
  styleUrls: ['./select-cita.component.less']
})
export class SelectCitaComponent implements OnInit {
  displayedColumns: string[] = ['Prestacion', 'DescPrestacion', 'Especialidad', 'Subespecialidad', 'Servicio', 'Convenio', 'Medico', 'Sel'];
  dataSource;
  citas: any[];

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<SelectCitaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.citas = data;
    }

  ngOnInit() {
    this.dataSource = this.citas;
  }

  select(selectCita: any) {
    this.dialogRef.close(selectCita);
  }

  close() {
    this.dialogRef.close();
  }
}
