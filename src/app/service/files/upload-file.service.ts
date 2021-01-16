import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticatedService } from '../user/authenticated.service';
import { environment } from 'src/environments/environment';
import { FileSharePoint } from 'src/app/models/SharePoint/FileSharePoint';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  constructor(private http: HttpClient) { }

  uploadFiles(fileSharePoint:FileSharePoint) {
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/SharePoint/subirDoc', fileSharePoint);
  }

  downloadFile(fileSharePoint:FileSharePoint) {

    // fileSharePoint.ormIdOrdmNumero = 4746;
    // fileSharePoint.nombreArchivo = "OM-52957812-4746.png";

    console.log("Test 200", fileSharePoint);


    
    return this.http.post( environment.url + '/CentralAutorizav2/rest/SharePoint/buscarDoc', fileSharePoint, {responseType: 'blob'});
  }

  deleteFile(fileSharePoint:FileSharePoint) {
    return this.http.post<any>( environment.url + '/CentralAutorizav2/rest/SharePoint/eliminarDoc', fileSharePoint);
  }
}
