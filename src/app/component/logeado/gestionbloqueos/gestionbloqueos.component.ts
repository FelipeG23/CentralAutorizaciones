import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TipodocService } from 'src/app/service/catalogos/tipodoc.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from 'ng-animate';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatPaginator, MatTableDataSource, MatSort, PageEvent } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { ConsultarordenService } from 'src/app/service/ordenmedica/consultarorden.service';
import * as moment from 'moment';
import { TrazaOrdenComponent } from 'src/app/modals/trazaorden/trazaorden.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { ConsultaService } from '../../../service/citas/consulta.service';
import { RegistrarautorizacionCitaComponent } from '../registrarautorizacioncita/registrarautorizacioncita.component';
import { CaGestionAutorizacionCita } from '../../../models/orden-medica/CaGestionAutorizacionCita';
import { AngularFirestore } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { VerRadicarComponent } from 'src/app/modals/ver-radicar/ver-radicar.component';
import { VerDerivacionesComponent } from 'src/app/modals/ver-derivaciones/ver-derivaciones.component';
import { OrdenService } from 'src/app/service/ordenmedica/orden.service';
import { CaPrestacionesOrdMed } from 'src/app/models/orden-medica/CaPrestacionesOrdMed';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';
import { Bloqueo } from 'src/app/models/firebase/bloqueo';
import { Userlock } from 'src/app/models/firebase/userlock';
import { stringify } from 'querystring';
import { analytics } from 'firebase';

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-autorizar',
    templateUrl: './gestionbloqueos.component.html',
    styleUrls: ['./gestionbloqueos.component.less'],
    animations: [
        trigger('fadeIn', [transition('* => *', useAnimation(fadeIn, {
            // Set the duration to 5seconds and delay to 2seconds
            params: { timing: 5, delay: 2 }
        }))])
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class GestionBloqueos implements OnInit {
    page = 0;
    size = 11;
    length = 150;
    pageSize = 10;
    pageSizeOptions: number[] = [5, 10, 20];
    pageEvent: PageEvent;

    // order= 'fecha';
    // asc=false
    citasAuto: Array<any>;
    filtroOrdenes: FormGroup;
    options: any;
    spinnerCA: boolean;
    icon = 'keyboard_arrow_down';
    validar = false;
    nameRequired = false;
    imageSrc: any;
    subir: boolean;
    success = false;
    result: any;
    progress: boolean;
    ordenesMedicas: any[];
    ordenesMedicasRadicadas: any[];
    citasPorAutorizar: any[];
    citasAutorizadas: any[];
    json: any = [
        {DateActive:'1', DateBlocked: 'aaaa', numDocumento: '34342342', UserActive: {Nombre: "nombre", cc: "1111"}},
        {DateActive:'2', DateBlocked: 'bbbbb', numDocumento: '213123123', UserActive: {Nombre: "nombre1", cc: "1111"}},
        {DateActive:'3', DateBlocked: 'ccccc', numDocumento: '3425', UserActive: {Nombre: "nombre2", cc: "1111"}},
        {DateActive:'4', DateBlocked: 'ddddd', numDocumento: '3242344', UserActive: {Nombre: "nombre3", cc: "1111"}}
    ];
    date = new Date();
    minDateValue = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDay() - (14 - this.date.getDay() + 1));
    maxDateValue = new Date(this.date.getFullYear(), this.date.getMonth() + 2, this.date.getDay() + (30 - this.date.getDay() - 2));
    minDate = new Date(this.date.getFullYear(), 0, 1);
    maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxDateFin = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
    displayedColumns: string[] = ['cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'radicar'];
    displayedColumnsCitas: string[] = ['cgFechaProceso', 'diaFechaCita', 'tipTipIDav', 'documento', 'nombreCompleto', 'valorProcedimiento', 'enProceso', 'autorizar'];
    displayedColumnsCitasAutorizadas: string[] = ['DateActive', 'DateBlocked', 'UserActive'];
    dataSource = new MatTableDataSource(this.ordenesMedicas);
    @ViewChild('paginatorCitas', { read: MatPaginator }) paginatorCitas: MatPaginator;
    @ViewChild('paginatorCitasAutorizadas', { read: MatPaginator }) paginatorCitasAutorizadas: MatPaginator;
    @ViewChild('paginatorPorRadicadar', { read: MatPaginator }) paginatorPorRadicadar: MatPaginator;
    @ViewChild('paginatorRadicadas', { read: MatPaginator }) paginatorRadicadas: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // tslint:disable-next-line: max-line-length
    displayedColumnsRadicadas: string[] = ['estado', 'ormIdOrdmNumero', 'cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'cita', 'enProceso', 'continuidad', 'autorizacion'];
    dataSourceRadicadas = new MatTableDataSource(this.ordenesMedicasRadicadas);
    // @ViewChild('sortRadicadas', {read: MatSort}) sortRadicadas: MatSort;
    dataSourceCitas = new MatTableDataSource(this.citasPorAutorizar);
    dataSourceCitasAutorizadas = new MatTableDataSource(this.citasAutorizadas);
    bloqueo: any;
    idFire: any;
    fireCA: any;
    user: any;
    response: any;
    dataLock: Bloqueo = new Bloqueo();
    metodo: any;
    resultados: any;

    valor: any;
    validarName = false;
    ordenMedica: any;
    listaCitasAutorizadas: any[];
    aux: any ;


    constructor(private fb: FormBuilder,
        public dialog: MatDialog,
        private firestore: AngularFirestore,
        private cookie: CookieService,
        private router: Router,
        private spinnerService: NgxSpinnerService,
        private tipodocService: TipodocService,
        private renderer: Renderer2,
        private bloqueoService: BloqueoService) {
        this.user = cookie.get('cenAuth');
        this.user = JSON.parse(atob(this.user));

    }

    ngOnInit() {
        this.dataSourceCitasAutorizadas.paginator = this.paginatorCitasAutorizadas;
        this.callSubmits();
        this.onSubmitCitas();
    }

    onSubmitCitas(isList?) {
        this.bloqueoService.obtenerCitasBloqueadas('userInfoPrueba').subscribe(citasbloq => {
            this.citasAutorizadas = citasbloq;
            for (let entry of this.citasAutorizadas) {
                 this.aux = entry.DateBlocked;
                var d = new Date(this.aux);
                entry.DateBlocked = d.toLocaleString();
                console.log(entry); // 1, "string", false
              }
            this.dataSourceCitasAutorizadas.data = this.citasAutorizadas;
            console.log('citas autorizadas: ', this.citasAutorizadas);
            console.log('version 2: ', this.dataSourceCitasAutorizadas);
            console.log('json: ', this.json);
        })
    }
    callSubmits() {
        this.onSubmitCitas();
    }

    unSubcribeFirebase() {
        this.metodo.unsubscribe();
    }

}