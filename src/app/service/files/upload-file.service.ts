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
    return this.http.post<any>( environment.url + '/CentralAutoriza/rest/SharePoint/subirDoc', fileSharePoint);
  }

  downloadFile(fileSharePoint:FileSharePoint) {
    return this.http.post( environment.url + '/CentralAutoriza/rest/SharePoint/buscarDoc', fileSharePoint, {responseType: 'blob'});
  }

  deleteFile(fileSharePoint:FileSharePoint) {
    return this.http.post<any>( environment.url + '/CentralAutoriza/rest/SharePoint/eliminarDoc', fileSharePoint);
  }
}
