import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CaPrestacionesOrdMed } from "src/app/models/orden-medica/CaPrestacionesOrdMed";

@Component({
  selector: 'app-select-prestacion',
  templateUrl: './select-prestacion.component.html',
  styleUrls: ['./select-prestacion.component.less']
})
export class SelectPrestacionComponent implements OnInit {
  displayedColumns: string[] = ['codServicio', 'descServicio', 'codCUP', 'descCUP', 'Sel'];
  dataSource;
  prestaciones: CaPrestacionesOrdMed[];

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<SelectPrestacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.prestaciones = data;
    }

  ngOnInit() {
    this.dataSource = this.prestaciones;
  }

  select(selectPrestacion:CaPrestacionesOrdMed){
    this.dialogRef.close(selectPrestacion);
  }

  close() {
    this.dialogRef.close();
  }
}
