import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PageEvent, MatDialog } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { CambiocitaComponent } from 'src/app/modals/cambiocita/cambiocita.component';
import { TrazaComponent } from 'src/app/modals/traza/traza.component';
import { TipodocService } from 'src/app/service/catalogos/tipodoc.service';
import { ConvenioService } from 'src/app/service/catalogos/convenio.service';
import { SedesService } from 'src/app/service/catalogos/sedes.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from 'ng-animate';
import { NgxSpinnerService } from 'ngx-spinner';


import * as moment from 'moment';
import { ConsultaService } from 'src/app/service/citas/consulta.service';
import { DetallepacienteComponent } from 'src/app/modals/detallepaciente/detallepaciente.component';
import { EspecialidadService } from 'src/app/service/catalogos/especialidades.service';
import { PlansDocService } from 'src/app/service/dondoctor/plans-doc.service';
import { AuthenticateDocService } from 'src/app/service/dondoctor/authenticate-doc.service';
import { ClasificacionService } from 'src/app/service/catalogos/clasificacion.service';
import swal from 'sweetalert';
import { ServiciosService } from 'src/app/service/catalogos/servicios.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Roles } from '../../../models/Roles';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Filtrocitasconvenios } from 'src/app/models/citas/filtrocitasconvenios';
import { BloqueoService } from 'src/app/service/firebase/bloqueo.service';
import { Userlock } from 'src/app/models/firebase/userlock';
import { Bloqueo } from 'src/app/models/firebase/bloqueo';
import { Listaubicacion } from 'src/app/models/ubicacion/listaubicacion';

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
    selector: 'app-citasconsulta',
    templateUrl: './citasconsulta.component.html',
    styleUrls: ['./citasconsulta.component.less'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
    animations: [
        trigger('fadeIn', [transition('* => *', useAnimation(fadeIn, {
            params: { timing: 5, delay: 2 }
        }))])
    ],
})
export class CitasconsultaComponent implements OnInit {
    filtroCitas: FormGroup;
    pageEvent: PageEvent;
    options: any;
    date = new Date();
    fechaFin = new Date();
    msjExp: boolean;
    minDateValue = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxDateValue = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 8);
    minDate = new Date(this.date.getFullYear(), 0, 1);
    minDateIn = new Date(this.date.getFullYear(), 0, 1);
    maxDateIni = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 90);
    maxDateFin = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 8);
    maxDateIniAutorizacion = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxDateFinAutorizacion = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 8);
    classCA: boolean;
    pageActual: number = 1;
    filters: any;
    validar: boolean = false;
    nameRequired: boolean = false;
    secondNameRequired: boolean = false;
    especialidades: string[] = [];
    filteredEspList: Observable<string[]>;
    subEspecialidadesAll: any[] = [];
    subEspecialidades: any[] = [];
    filteredSubEspList: Observable<string[]>;
    serviciosAll: any[] = [];
    servicios: any[] = [];
    filteredServList: Observable<any>;
    sedes: string[] = [];
    filteredSedeList: Observable<string[]>;
    convenios: any[] = [];
    ubicacionesList: any;
    validarName: boolean = false;
    fechaHoy: Date;
    fechaHoy1: string;
    actual: Date;
    nuevoMes: number;
    horaHoy: string;
    jsonSize: number;
    user: any;
    roleConsulta: string = Roles.CONSULTA;
    idFire: any;
    fireCA: any;
    roleAdmin: string = Roles.ADMIN;
    listConvenios: Filtrocitasconvenios = new Filtrocitasconvenios();
    // descripList: Filtrocitasconvenios[];
    conveniosLista: Filtrocitasconvenios[] = [];
    timer: any;
    counter: number = 25;
    dataLock: Bloqueo = new Bloqueo();
    resultados: any;
    valor: any;
    metodo: any;

    constructor(private fb: FormBuilder,
        public dialog: MatDialog,
        private tipodocService: TipodocService,
        private convenioService: ConvenioService,
        private sedesService: SedesService,
        private especialidadService: EspecialidadService,
        private serviciosService: ServiciosService,
        private consulta: ConsultaService,
        private clasificacionService: ClasificacionService,
        private plansDocService: PlansDocService,
        private spinner: NgxSpinnerService,
        private authenticateDocService: AuthenticateDocService,
        private db: AngularFireDatabase,
        private bloqueoService: BloqueoService,
        private firestore: AngularFirestore,
        private router: Router,
        private cookie: CookieService) {
        this.cookie.delete('donDoctor');
        this.options = this.tipodocService.getTipoDoc();
        this.user = cookie.get('cenAuth');
        this.user = atob(this.user);
        this.user = JSON.parse(this.user);

    }

    ngOnInit() {

        this.setLists();
        this.fechaHoy = new Date();
        this.fechaHoy1 = this.fechaHoy.getDate() + '-' + (this.fechaHoy.getMonth() + 1) + '-' + this.fechaHoy.getFullYear();

       
        this.horaHoy = this.fechaHoy.getHours() + ":" + this.fechaHoy.getMinutes() + 'Hrs.';
        this.filtroCitas = this.fb.group({
            fecha: [{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]],
            fechaFinal: [{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]],
            especialidad: ['', this.checkList(this.especialidades)],
            subEspecialidad: ['', this.checkList(this.subEspecialidades)],
            servicio: ['', this.checkList(this.servicios)],
            sede: ['', this.checkList(this.sedes)],
            estado: [null],
            convenio: [null],
            tipoDocumento: [''],
            numeroDocumento: ['', [Validators.maxLength(20), Validators.pattern(/^[A-ZÑa-zñ0-9\s]+$/)]],
            nombre: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            primerApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            segundoApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            ubicacionesFilter: ['']
        });

    
    }

    openDialog(datoCambio): void {
        this.dataLock.UserActive = new Userlock();
        this.dataLock.DateActive = datoCambio.pacNum
        this.dataLock.UserActive.Documento = this.user.uid;
        this.dataLock.UserActive.Nombre = this.user.cn;
        if(localStorage.getItem('lock')){
            this.bloqueoService.unLockAll()
        }
        this.metodo = this.bloqueoService.search('userInfo', this.dataLock.DateActive).subscribe(data => {
            this.unSubcribeFirebase()
            if(data.length){
                this.resultados = data;
                swal({
                    title: 'Cita bloqueada',
                    text: `Esta cita se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
                    icon: 'info',
                  });
            } else {
                this.valor = this.bloqueoService.lock(this.dataLock, 'userInfo');
                localStorage.setItem('lock', this.valor.key);
                this.timer = setInterval(() => { this.alertUnlock(); }, this.counter * 60000);
                const dialogRef = this.dialog.open(CambiocitaComponent, {
                    data: {
                        myVar: { data: datoCambio },
                    },
                    height: '500px'
                });
                dialogRef.afterClosed().subscribe(result => {
                    clearInterval(this.timer);
                    this.bloqueoService.unLock('userInfo/');
                    if (result != null) {
                        datoCambio.estadoCita = result;
                        this.filters.sort((a, b) => (a.estadoCita > b.estadoCita ? 1 : -1));
                        this.bloqueoService.unLock('userInfo/');
                        clearInterval(this.timer);
                    }
                    if (result === undefined) {
                        this.bloqueoService.unLock('userInfo/');
                        clearInterval(this.timer);
                    }
                });
            }
        });
    }
    

    openDialogTraza(datoTraza): void {
        const dialogRef = this.dialog.open(TrazaComponent, {
            height: '500px',
            data: datoTraza
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    openDialogDetalle(datoDetalle): void {
        const dialogRef = this.dialog.open(DetallepacienteComponent, {
            data: {
                myVar: { data: datoDetalle }
            },
            height: '500px',
            width: '750px',
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    onSubmit() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        const months = this.filtroCitas.get("fechaFinal").value
            .diff(this.filtroCitas.get("fecha").value, 'months', true);
        if (months > 1) {
            swal({
                title: 'Error',
                text: 'El filtro de fechas supera al de un mes',
                icon: 'warning',
            });
            return;
        }
        if (!this.filtroCitas.invalid) {
            this.spinner.show();
            this.consulta.getCitas(this.filtroCitas.getRawValue(), this.conveniosLista).subscribe(data => {
                this.spinner.hide();
                if (Object.keys(data).length > 0) {
                    this.jsonSize = Object.keys(data).length;
                    this.filters = data;
                    this.filters.map(c => c.estadoCita == null ? c.estadoCita = 'ASIGNADA' : c.estadoCita = c.estadoCita);
                    this.filters.sort((a, b) => (a.estadoCita > b.estadoCita ? 1 : -1));
                } else {
                    this.jsonSize = 0;
                    this.filters = [];
                    swal({
                        title: 'Sin resultados',
                        text: 'No se encontraron resultados para su consulta',
                        icon: 'warning',
                    });
                }
            }, err => {
                this.spinner.hide();
                swal({
                    title: 'Error',
                    text: 'No se pudo consultar las citas, por favor consulte con soporte',
                    icon: 'warning',
                });
            });
        }
    }

    clear() {
        this.listConvenios = new Filtrocitasconvenios();
        this.conveniosLista = [];
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        this.fechaHoy = new Date();
        this.fechaHoy1 = this.fechaHoy.getDate() + '-' + (this.fechaHoy.getMonth() + 1) + '-' + this.fechaHoy.getFullYear();
        this.horaHoy = this.fechaHoy.getHours() + ':' + this.fechaHoy.getMinutes() + 'Hrs.';
        this.filtroCitas = this.fb.group({
            fecha: [{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]],
            fechaFinal: [{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]],
            especialidad: ['', this.checkList(this.especialidades)],
            subEspecialidad: ['', this.checkList(this.subEspecialidades)],
            servicio: ['', this.checkList(this.servicios)],
            sede: ['', [this.checkList(this.sedes)]],
            estado: [null],
            convenio: [null],
            tipoDocumento: [''],
            numeroDocumento: ['', [Validators.pattern(/^[A-ZÑa-zñ0-9\s]+$/)]],
            nombre: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            primerApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            segundoApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            page: [1],
            ubicacionesFilter: ['']
        });
        this.jsonSize = null;
        this.filters = null;

        this.filteredEspList = this.filtroCitas.get('especialidad').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.especialidades))
            );

        this.filteredSubEspList = this.filtroCitas.get('subEspecialidad').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.subEspecialidades))
            );

        this.filteredServList = this.filtroCitas.get('servicio').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.servicios))
            );

        this.filteredSedeList = this.filtroCitas.get('sede').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.sedes))
            );

        this.validarName = false;
        this.nameRequired = false;
        this.validar = false;
        this.secondNameRequired = false;
    }

    validateNumber() {
        if (this.filtroCitas.value.tipoDocumento === 'M' ||
            this.filtroCitas.value.tipoDocumento === 'A' ||
            this.filtroCitas.value.tipoDocumento === '' ||
            this.filtroCitas.value.tipoDocumento === ' ') {
            this.validar = false;
        } else {
            this.validar = true;
            this.validarName = false;
        }
    }

    changeSecondDate() {
        this.actual = new Date();
        this.fechaFin.setDate((this.minDate.getFullYear(), this.minDate.getMonth(), this.filtroCitas.getRawValue().fecha.date()));
        this.filtroCitas.get('fechaFinal').setValue(this.fechaFin);
        this.maxDateValue = new Date(this.minDate.getFullYear(), (this.fechaFin.getMonth()), (this.fechaFin.getDate() + 8));
        this.minDate = new Date(this.fechaFin.getFullYear(), this.fechaFin.getMonth(), this.fechaFin.getDate());
        this.maxDateFin = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate() + 8);
        if ((this.fechaFin.getMonth() + 1) !== (this.filtroCitas.getRawValue().fecha.month() + 1)) {
            this.minDate.setMonth(((this.filtroCitas.getRawValue().fecha.month())));
            this.maxDateValue.setMonth(((this.filtroCitas.getRawValue().fecha.month())));
            if (this.actual.getMonth() !== this.filtroCitas.getRawValue().fecha.date()) {
                this.maxDateFin = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate() + 8);
                console.log('this.maxDateValue - ' + this.maxDateValue);
                console.log('this.maxDateFin - ' + this.maxDateFin);
            }
            if ((this.filtroCitas.getRawValue().fecha.date()) >= 22) {
                this.maxDateValue.setMonth(((this.filtroCitas.getRawValue().fecha.month() + 1)));
            }
        }

        this.filtroCitas = this.fb.group({
            fecha: [{ disabled: true, value: moment(this.minDate) }, [Validators.required]],
            fechaFinal: [{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]],
            especialidad: ['', this.checkList(this.especialidades)],
            subEspecialidad: ['', this.checkList(this.subEspecialidades)],
            servicio: ['', this.checkList(this.servicios)],
            sede: ['', this.checkList(this.sedes)],
            estado: [null],
            convenio: [null],
            tipoDocumento: [''],
            numeroDocumento: ['', [Validators.maxLength(20), Validators.pattern(/^[A-ZÑa-zñ0-9\s]+$/)]],
            nombre: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            primerApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            segundoApellido: ['', [Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),
            Validators.pattern(/^(?!.*(.)\1{3})/)]],
            ubicacionesFilter: ['']
        });
    }

    validarFechas() {
            if ((this.filtroCitas.getRawValue().fecha.month() + 1) <= (this.filtroCitas.getRawValue().fechaFinal.month() + 1)) {
                if (this.filtroCitas.getRawValue().fecha.year() === this.filtroCitas.getRawValue().fechaFinal.year() &&
                    (this.filtroCitas.getRawValue().fecha.month() + 1) === (this.filtroCitas.getRawValue().fechaFinal.month() + 1) &&
                    this.filtroCitas.getRawValue().fecha.date() > this.filtroCitas.getRawValue().fechaFinal.date()) {
                    this.filtroCitas.controls['fechaFinal'].setValue('');
                    swal({
                        title: 'Error',
                        text: 'Rango final cita no puede ser menor a Rango inicial cita, verifique',
                        icon: 'warning',
                    });
                    this.msjExp = true;
                } else {
                    this.msjExp = false;
                }
            } else {
                this.filtroCitas.controls['fechaFinal'].setValue('');
                swal({
                    title: 'Error',
                    text: 'Rango final cita no puede ser menor a Rango inicial cita, verifique',
                    icon: 'warning',
                });
                this.msjExp = true;
            }
    }

    validateTypeDocument() {
        const value = this.filtroCitas.get('tipoDocumento').value;
        if (value === 'M' || value === 'A') {
            this.validarName = true;
            this.validar = false;
        } else {
            this.validarName = false;
            this.validar = true;
        }
    }

    validateName(event) {
        if (event.target.value.length > 0) {
            this.nameRequired = true;
        } else {
            this.nameRequired = false;
        }
    }

    validateSecondName(event) {
        if (event.target.value.length > 0) {
            this.secondNameRequired = true;
        } else {
            this.secondNameRequired = false;
        }
    }

    displayFn(item) {
        return item ? item.descripcion : undefined;
    }

    private _filter(value: string, list: any[]): string[] {
        if (typeof value === "string") {
            if (value.length === 0) return list;
            const filterValue = value.toLowerCase();
            return list.filter(option => option.descripcion.toLowerCase().includes(filterValue));
        }
    }

    private getStringAutorizacion(gauAutorizaServ: string) {
        switch (gauAutorizaServ) {
            case '1': return 'AUTORIZADA';
            case '2': return 'NO AUTORIZADA';
        }
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

    private setLists() {
        this.especialidadService.getEspecialidades().subscribe(data => {
            this.especialidades = data;
            this.filteredEspList = this.filtroCitas.get('especialidad').valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value, this.especialidades))
                );
        });
        this.serviciosService.getSubEspecialidades().subscribe(data => {
            this.subEspecialidades = data;
            this.subEspecialidadesAll = data;
            this.filteredSubEspList = this.filtroCitas.get('subEspecialidad').valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value, this.subEspecialidades))
                );
        });
        this.serviciosService.getServicios().subscribe(data => {
            this.servicios = data;
            this.serviciosAll = data;
            this.filteredServList = this.filtroCitas.get('servicio').valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value, this.servicios))
                );
        });
        this.sedesService.getSedes().subscribe(data => {
            this.sedes = data;
            this.filteredSedeList = this.filtroCitas.get('sede').valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value, this.sedes))
                );
        });
        this.convenioService.getConvenio().subscribe(data => {
            this.convenios = data;
        });
        this.convenioService.getUbicaciones().subscribe(data => {
            this.ubicacionesList = data;
        })

    }

    getSigla(value) {
        switch (value) {
            case "ASIGNADA": return "A";
            case "CONFIRMADA": return "C";
            case "CANCELADA POR PACIENTE": return "CP";
            case "CANCELADA POR MEDICO": return "CM";
            case "REPROGRAMADA": return "R";
            case "AUTORIZADA": return "AU";
            case "NO AUTORIZADA": return "NA";
        }
    }

    changeSubs() {
        const code = this.filtroCitas.get('especialidad').value.id;
        this.filtroCitas.patchValue({ subEspecialidad: '' });
        this.filtroCitas.patchValue({ servicio: '' });
        this.subEspecialidades = this.subEspecialidadesAll;
        if (code) {
            this.subEspecialidades = this.subEspecialidades.filter(sub => sub.otro === code.trim());
        }
        this.filteredSubEspList = this.filtroCitas.get('subEspecialidad').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.subEspecialidades))
            );
    }

    changeServs() {
        const codeEsp = this.filtroCitas.get('especialidad').value.id;
        const code = this.filtroCitas.get('subEspecialidad').value.id;
        this.filtroCitas.patchValue({ servicio: '' });
        this.servicios = this.serviciosAll;
        if (code) {
            // this.servicios = this.servicios.filter(ser => ser.otro === code);
            this.servicios = this.servicios.filter(ser => ser.otro === code.trim() && ser.otros === codeEsp.trim());
        }

        this.filteredServList = this.filtroCitas.get('servicio').valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value, this.servicios))
            );
    }

    updateAsistencia(data, estado) {
        this.spinner.show();
        this.consulta.updateAsistencia(data.idCita, estado).subscribe(
            (data) => {
                this.spinner.hide();
            },
            (error) => {
                this.spinner.hide();
                data.asistencia = '2';
                swal({
                    title: 'Error',
                    text: 'No se pudo actualizar la asitencia de la cita, por favor reintentar en unos minutos',
                    icon: 'warning',
                });
            }
        );
    }


    listMia(event) {
        this.listConvenios.descripcion = event.target.value;
        let idConvenio = this.convenios.filter(data => {
            if (data.descripcion === event.target.value) {
                return data.id
            }
        });
        for (let list of idConvenio) {
            this.listConvenios.id = list.id;
        }
        this.conveniosLista.push(this.listConvenios);
        this.listConvenios = new Filtrocitasconvenios();
        this.filtroCitas.get('convenio').setValue('');
    }

    removeConvenio(event) {
        this.conveniosLista = this.conveniosLista.filter(data => data.id !== event.id)
    }

    alertUnlock(): string {
        if (this.cookie.check('lock')) {
            swal({
                title: 'Desbloqueo',
                text: '¿Desea que se desbloquee la cita?',
                icon: 'warning',
                buttons: ['Continuar', 'Desbloquear'],
                dangerMode: true
            }).then((unLock) => {
                this.timer = setInterval(() => { this.bloqueoService.unLockAll() }, 10 * 60000);
                if (unLock !== null) {
                    this.bloqueoService.unLockAll();
                    clearInterval(this.timer);
                    swal('Se ha desbloqueado la cita correctamente', {
                        icon: 'success',
                    });
                } else {
                    clearInterval(this.timer);
                    this.timer = setInterval(() => { this.alertUnlock() }, this.counter * 60000);
                }
            });
        }
        return 'true';
    }

    unSubcribeFirebase(){
        this.metodo.unsubscribe();
    }
}
