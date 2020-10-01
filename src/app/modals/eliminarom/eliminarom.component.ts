import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import swal from 'sweetalert';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileSharePoint } from 'src/app/models/SharePoint/FileSharePoint';
import { UploadFileService } from 'src/app/service/files/upload-file.service';

@Component({
  selector: 'app-eliminarom',
  templateUrl: './eliminarom.component.html',
  styleUrls: ['./eliminarom.component.less']
})
export class EliminaromComponent implements OnInit {
  motivosEliminacion: any;
  ormId:any;
  userUid:any;
  razon:any;
  fileSharePoint: FileSharePoint = new FileSharePoint();
  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private ordenService: OrdenService,
    public spinnerService: NgxSpinnerService,
    private uploadFileService: UploadFileService,
    public dialogRef: MatDialogRef<EliminaromComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.ormId=data.ormId,
      this.userUid=data.userUid,
      this.fileSharePoint=data.sharepoint
    }

  ngOnInit() {
    this.ordenService.obtenerMotivosEliminacion().subscribe(
      data => {
        this.motivosEliminacion=data;
        this.spinnerService.hide
        ();
      }, error => {
        swal({
          title: 'Error',
          text: 'No se pudo obtener la información.',
          icon: 'warning',
        }).then(() => {
         
        });
      });



  }

  checkList(itemsChek: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        const item = control.value;
        if (item.length > 0 && !itemsChek.includes(item)) {
            return { 'matchList': item };
        }
        return null;
    };
}
  eliminar() {
    if(null==this.razon){
      swal({
        title: 'Seleccione',
        text: 'Por favor seleccione un motiv',
        icon: 'warning',
      })
    }else{
    this.ordenService.eliminarOrden(this.ormId,this.userUid,this.razon).subscribe(
      data => {
        this.uploadFileService.deleteFile(this.fileSharePoint).subscribe(
          data => {
            this.spinnerService.hide();
            swal({
              title: 'Proceso exitoso!',
              text: 'Orden medica eliminada',
              icon: 'success',
            }).then(() => {
              this.dialogRef.close();
            });
          }, error => {
            this.spinnerService.hide();
            swal({
              title: 'Error',
              text: 'No se pudo eliminar el documento correspondiente a la orden médica.',
              icon: 'warning',
            }).then(() => {
              console.log(error);
            });
          }
        );
      }, error => {
        this.spinnerService.hide();
        swal({
          title: 'Error',
          text: 'No se pudo eliminar la orden médica.',
          icon: 'warning',
        }).then(() => {
          console.log(error);
        });
      }
    );
  }
  }


  close() {
    this.dialogRef.close();
  }
 

}
