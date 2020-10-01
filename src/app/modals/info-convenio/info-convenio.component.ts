import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConvenioService } from 'src/app/service/catalogos/convenio.service';
import { AuthenticateDocService } from 'src/app/service/dondoctor/authenticate-doc.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-info-convenio',
  templateUrl: './info-convenio.component.html',
  styleUrls: ['./info-convenio.component.less']
})
export class InfoConvenioComponent implements OnInit {
  convenio: any;
  preloader: boolean;
  errorData: boolean;
  informacionObtenerConvenio: any;

  constructor(private convenioService: ConvenioService,
              private authenticateDocService: AuthenticateDocService,
              private cookie: CookieService,
              public dialogRef: MatDialogRef<InfoConvenioComponent>,
              @Inject(MAT_DIALOG_DATA) public dataInfo: any) {
                this.authenticateDocService.getAuthenticatedDonDoctor().subscribe(
                  data => this.cookie.set('donDoctor', JSON.stringify(data)));
              }

  close() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.preloader = true;
    this.informacionObtenerConvenio = this.dataInfo.myVar.data.codigoPrestacion !== undefined ?this.dataInfo.myVar.data : this.dataInfo.myVar.data.myVar.data;
    if (this.cookie.check('donDoctor')) {
      this.getConvenio();
    } else {
      this.authenticateDocService.getAuthenticatedDonDoctor().subscribe(
        data => {
          this.cookie.set('donDoctor', JSON.stringify(data))
          this.getConvenio();
        });
    }
  }


  getConvenio(){
    this.convenioService.getInfoConvenio(this.informacionObtenerConvenio).subscribe(data => {
      this.convenio = data;
      this.preloader = false;
      this.errorData = false;
    }, error => {
      console.log(error);
      this.errorData = true;
      this.preloader = false;
    });
  }

}
