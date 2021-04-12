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
    date = new Date();
    minDateValue = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDay() - (14 - this.date.getDay() + 1));
    maxDateValue = new Date(this.date.getFullYear(), this.date.getMonth() + 2, this.date.getDay() + (30 - this.date.getDay() - 2));
    minDate = new Date(this.date.getFullYear(), 0, 1);
    maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxDateFin = new Date(this.date.getFullYear() + 1, this.date.getMonth(), this.date.getDate());
    displayedColumns: string[] = ['cgFechaProceso', 'tipTipIDav', 'documento', 'nombreCompleto', 'radicar'];
    displayedColumnsCitas: string[] = ['cgFechaProceso', 'diaFechaCita', 'tipTipIDav', 'documento', 'nombreCompleto', 'valorProcedimiento', 'enProceso', 'autorizar'];
    displayedColumnsCitasAutorizadas: string[] = ['idCita', 'fechaCita', 'codAutorizacion', 'tipTipIDav', 'documento', 'nombreCompleto', 'valorProcedimiento', 'enProceso'];
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



    constructor(private fb: FormBuilder,
        public dialog: MatDialog,
        private consultaService: ConsultaService,
        private consultarordenService: ConsultarordenService,
        private firestore: AngularFirestore,
        private cookie: CookieService,
        private router: Router,
        private spinnerService: NgxSpinnerService,
        private tipodocService: TipodocService,
        private renderer: Renderer2,
        private bloqueoService: BloqueoService,
        private ordenService: OrdenService) {
        this.options = tipodocService.getTipoDoc();
        this.user = cookie.get('cenAuth');
        this.user = JSON.parse(atob(this.user));

    }

    ngOnInit() {
        moment.locale('es');
        moment.relativeTimeThreshold('m', 60);
        moment.relativeTimeThreshold('h', 24 * 26);
        this.initFilter();
        this.dataSource.sort = this.sort;
        this.dataSourceCitas.paginator = this.paginatorCitas;

        this.dataSourceCitasAutorizadas.paginator = this.paginatorCitasAutorizadas;
        this.dataSource.paginator = this.paginatorPorRadicadar;
        this.dataSourceRadicadas.paginator = this.paginatorRadicadas;
        this.callSubmits();
        this.onSubmitCitas();
    }

    onSubmitCitas(isList?) {
        const months = this.filtroOrdenes.get('fechaFinal').value
            .diff(this.filtroOrdenes.get('fecha').value, 'months');
        if (!this.filtroOrdenes.invalid) {
            this.spinnerService.show();
            this.consultaService.getCitasPorAutorizar(this.filtroOrdenes.getRawValue()).subscribe(data => {
                this.spinnerService.hide();
                this.citasPorAutorizar = data;
                this.consultaService.postCitasAutorizadas(this.page, this.size)
                    // this.consultaService.postCitasAutorizadas(this.paginatorCitas.pageIndex, this.paginatorCitas.pageSize + 1))
                    .subscribe((data: any) => {
                        // this.citasAutorizadas = data.sort((a, b) => b.fechaAutorizacion - a.fechaAutorizacion);
                        this.citasAutorizadas = data;
                        this.dataSourceCitasAutorizadas.data = this.citasAutorizadas;
                    });
                //    this.datosUsuarios = this.listaUsuariosRegistro.find(word => word._id === this.registro.id);
                this.dataSourceCitas.data = this.citasPorAutorizar;
                if (isList) {
                    this.filtersApply();
                }
            }, err => {
                this.citasPorAutorizar = [];
                swal({
                    title: 'Error',
                    text: 'No se pudo consultar las citas, por favor consulte con soporte',
                    icon: 'warning',
                });
                console.log(err);
            });
        }
    }

    setPageSizeOptions(setPageSizeOptionsInput: any) {
        this.citasAutorizadas = null;
        this.consultaService.postCitasAutorizadas(setPageSizeOptionsInput.pageIndex, (setPageSizeOptionsInput.pageSize + 1))
            .subscribe((data: any) => {
                this.citasAutorizadas = data;
                this.dataSourceCitasAutorizadas.data = this.citasAutorizadas;
            });
    }

    initFilter() {
        this.filtroOrdenes = this.fb.group({
            fecha: [{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]],
            fechaFinal: [{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]],
            numeroDerivacion: [null,
                [Validators.minLength(1), Validators.maxLength(10),
                Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[0-9\s]+$/)]],
            fechaAbordaje: [{ disabled: true, value: null }],
            estadoAutorizacion: [null],
            tipoDocumento: [null],
            numeroDocumento: [null, [Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
            // tslint:disable-next-line: max-line-length
            nombre: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]],
            // tslint:disable-next-line: max-line-length
            primerApellido: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]],
            // tslint:disable-next-line: max-line-length
            segundoApellido: ['', [Validators.pattern(/^(?!.*(.)\1{3})/), Validators.pattern(/^[^^`|~!@$%^&*()\+=[{\]}'<,.>?\/";\\:¿¬°¡_\-´#0-9]+$/),]]
        });


    }

    callSubmits() {
        this.ordenesMedicas = null;
        this.ordenesMedicasRadicadas = null;
        this.citasPorAutorizar = null;
        this.onSubmitCitas();
        this.onSubmitPorRadicar([1, 2]);
        this.onSubmit([3]);
        this.filtroOrdenes.removeControl('fecha');
        this.filtroOrdenes.removeControl('fechaFinal');
        // tslint:disable-next-line: max-line-length
        this.filtroOrdenes.setControl('fecha', new FormControl([{ disabled: true, value: moment(this.minDateValue) }, [Validators.required]]));
        // tslint:disable-next-line: max-line-length
        this.filtroOrdenes.setControl('fechaFinal', new FormControl([{ disabled: true, value: moment(this.maxDateValue) }, [Validators.required]]));
    }

    validateTypeDocument() {
        const value = this.filtroOrdenes.get('tipoDocumento').value;
        if (value === 'M' || value === 'A') {
            this.validarName = false;
        } else {
            this.validarName = true;
        }
    }

    filterNative() {
        if (this.filtroOrdenes.valid) {
            this.onSubmitCitas(true);
            this.onSubmitPorRadicar([1, 2], true);
            this.onSubmit([3], true);
        }
    }

    filtersApply() {
        let tipoDoc;
        if (this.filtroOrdenes.value.numeroDocumento &&
            this.filtroOrdenes.value.tipoDocumento) {

            switch (this.filtroOrdenes.value.tipoDocumento) {
                case '2':
                    tipoDoc = 'RC';
                    break;
                case '3':
                    tipoDoc = 'TI';
                    break;
                case '4':
                    tipoDoc = 'CC';
                    break;
                case '5':
                    tipoDoc = 'CE';
                    break;
                case 'P':
                    tipoDoc = 'PA';
                    break;
            }

            this.citasPorAutorizar = this.citasPorAutorizar.sort((a, b) => b.cgFechaProceso - a.cgFechaProceso);

            this.citasPorAutorizar = this.citasPorAutorizar.filter(data => this.filtroOrdenes.value.numeroDocumento == data.numDocId &&
                data.tipTipIDav == tipoDoc);
            this.dataSourceCitas.data = this.citasPorAutorizar;

            this.ordenesMedicas = this.ordenesMedicas.sort((a, b) => b.cgFechaProceso - a.cgFechaProceso);

            this.ordenesMedicas = this.ordenesMedicas.filter(data =>
                data.documento.trim() == this.filtroOrdenes.value.numeroDocumento &&
                data.tipTipIDav == tipoDoc);
            this.dataSource.data = this.ordenesMedicas;

            this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.sort((a, b) => b.cgFechaProceso - a.cgFechaProceso);

            this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data =>
                data.documento.trim() == this.filtroOrdenes.value.numeroDocumento &&
                data.tipTipIDav == tipoDoc);
            this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;
        } else if (this.filtroOrdenes.value.nombre && this.filtroOrdenes.value.primerApellido) {
            const nombre = this.filtroOrdenes.value.segundoApellido ?
                this.filtroOrdenes.value.nombre + ' ' + this.filtroOrdenes.value.primerApellido + ' ' +
                this.filtroOrdenes.value.segundoApellido : this.filtroOrdenes.value.nombre + ' ' + this.filtroOrdenes.value.primerApellido;

            this.citasPorAutorizar = this.citasPorAutorizar.filter(data => nombre == data.nombreCompleto
            );
            this.dataSourceCitas.data = this.citasPorAutorizar;

            this.ordenesMedicas = this.ordenesMedicas.filter(data =>
                data.nombreCompleto == nombre);
            this.dataSource.data = this.ordenesMedicas;

            this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data =>
                data.nombreCompleto == nombre);
            this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;

        } else if (this.filtroOrdenes.value.estadoAutorizacion) {
            this.citasPorAutorizar = this.citasPorAutorizar.filter(data =>
                data.codEstadoCita == this.filtroOrdenes.value.estadoAutorizacion
            );
            this.dataSourceCitas.data = this.citasPorAutorizar;
        } else if (this.filtroOrdenes.value.numeroDerivacion) {
            this.ordenesMedicas = this.ordenesMedicas.filter(data =>
                data.ormIdOrdmNumero == this.filtroOrdenes.value.numeroDerivacion);
            this.dataSource.data = this.ordenesMedicas;
            this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data =>
                data.ormIdOrdmNumero == this.filtroOrdenes.value.numeroDerivacion);
            this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;
        } else if (this.filtroOrdenes.value.fechaAbordaje) {
            this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data =>
                data.fechaCitaCA == this.filtroOrdenes.value.fechaAbordaje);
            this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;
        }
    }

    handleInputChange(e) {
        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        const reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);
    }
    doFilter = (value: string) => {
        this.dataSource.filter = value.trim().toLocaleLowerCase();
    }

    _handleReaderLoaded(e) {
        this.subir = true;
        this.success = false;
        const reader = e.target;
        this.imageSrc = reader.result;
        localStorage.setItem('document', this.imageSrc);
        this.subir = true;
        return this.imageSrc;
    }

    changeChecks() {
        console.log('entra ');
    }

    clear() {
        this.filtroOrdenes.reset();
        this.validar = false;
        // this.filtroOrdenes.controls['fecha'].setValue(moment(this.minDateValue))
        // this.filtroOrdenes.controls['fechaFinal'].setValue(moment(this.maxDateValue))
        // this.initFilter();
        // this.callSubmits()
    }

    validateNumber() {
        if (this.filtroOrdenes.value.tipoDocumento === 'MENOR SIN IDENTIFICACION' ||
            this.filtroOrdenes.value.tipoDocumento === 'ADULTO SIN IDENTIFICACION') {
            this.validar = false;
        } else {
            this.validar = true;
        }
    }

    onSubmitPorRadicar(estados, isList?) {
        const months = this.filtroOrdenes.get('fechaFinal').value
            .diff(this.filtroOrdenes.get('fecha').value, 'months');
        // if (months > 1) {
        //     swal({
        //         title: 'Error',
        //         text: 'El filtro de fechas supera al de un mes',
        //         icon: 'warning',
        //     });
        //     return;
        // }
        // this.filtroOrdenes.patchValue({ 'fechaFinal': this.filtroOrdenes.get("fechaFinal").value.add(1, 'days') });
        if (!this.filtroOrdenes.invalid) {
            this.consultarordenService.filterOrdenes(this.filtroOrdenes.getRawValue(), estados).subscribe(data => {
                if (data.mensajeError == null) {
                    this.ordenesMedicas = data;
                    this.ordenesMedicas = this.ordenesMedicas.reverse();
                    this.dataSource.data = this.ordenesMedicas;
                    if (isList) {
                        this.filtersApply();
                    }
                } else {
                    swal({
                        text: data.mensajeError,
                        icon: 'warning',
                    });
                }
            }, err => {
                this.ordenesMedicas = [];
                swal({
                    title: 'Error',
                    text: 'No se pudo consultar la derivación, por favor consulte con soporte',
                    icon: 'warning',
                });
                console.log(err);
                this.onSubmit([2, 3, 4]);
            });
        }
    }

    onSubmit(estados, isList?) {
        const months = this.filtroOrdenes.get('fechaFinal').value
            .diff(this.filtroOrdenes.get('fecha').value, 'months');
        // if (months > 1) {
        //     swal({
        //         title: 'Error',
        //         text: 'El filtro de fechas supera al de un mes',
        //         icon: 'warning',
        //     });
        //     return;
        // }
        if (!this.filtroOrdenes.invalid) {
            this.consultarordenService.filterOrdenes(this.filtroOrdenes.getRawValue(), estados).subscribe(data => {
                if (data.mensajeError == null) {
                    this.ordenesMedicasRadicadas = data;
                    this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.filter(data => {
                        if (data.prestaciones !== data.continuidad || data.continuidad === null || data.prestaciones === null) {
                            if (data.prestaciones !== data.autorizadas + data.continuidad) {
                                return data;
                            }
                        }
                    });
                    this.ordenesMedicasRadicadas = this.ordenesMedicasRadicadas.reverse();

                    this.dataSourceRadicadas.data = this.ordenesMedicasRadicadas;
                    if (isList) {
                        this.filtersApply();
                    }
                } else {
                    swal({
                        text: data.mensajeError,
                        icon: 'warning',
                    });
                }
            }, err => {
                this.ordenesMedicasRadicadas = [];
                swal({
                    title: 'Error',
                    text: 'No se pudo consultar la derivación, por favor consulte con soporte',
                    icon: 'warning',
                });
                console.log(err);
            });
        }
    }

    validateName(event) {
        this.nameRequired = true;
    }

    openDialogTraza(datoTraza): void {
        this.dialog.open(TrazaOrdenComponent, {
            height: '500px',
            data: datoTraza
        });
    }

    openDialogAuto(datoTraza): void {
        localStorage.setItem('ordenId', datoTraza.ormIdOrdmNumero);
        this.spinnerService.show();
        this.consultarordenService.validarGestionContinuidad(datoTraza.ormIdOrdmNumero).subscribe((continuidad: boolean) => {
            if (!continuidad) {
                swal({
                    title: 'Información',
                    // tslint:disable-next-line: max-line-length
                    text: 'Para realizar la Autorización, por favor realice la gestión de continuidad, para la orden ' + datoTraza.ormIdOrdmNumero,
                    icon: 'info',
                });
                this.spinnerService.hide();
                return;
            }
            this.ordenService.getDetailOrden(datoTraza.ormIdOrdmNumero).subscribe(v => {
                this.spinnerService.hide();
                let caPrestacionesOrdMed: Array<CaPrestacionesOrdMed> = v.caPrestacionesOrdMed;
                if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
                    caPrestacionesOrdMed.length > 0) {
                    caPrestacionesOrdMed = caPrestacionesOrdMed.filter((caPrestacion: CaPrestacionesOrdMed) => {
                        return caPrestacion.caGestionAutorizacion === null ||
                            caPrestacion.caGestionAutorizacion.gauAutorizaServ === '3';
                    });
                    if (caPrestacionesOrdMed !== undefined && caPrestacionesOrdMed !== null &&
                        caPrestacionesOrdMed.length > 0) {
                        const dialogRef = this.dialog.open(VerDerivacionesComponent, {
                            height: '500px',
                            data: datoTraza,
                            disableClose: true
                        });
                        dialogRef.afterClosed().subscribe((data) => {
                            // consultamos nuevamente las derivaciones radicadas
                            this.ordenesMedicasRadicadas = null;
                            this.initFilter();
                            this.onSubmit([2, 3]);
                        });
                    }
                }
            }, () => {
                this.spinnerService.hide();
            });
        }, () => {
            this.spinnerService.hide();
        });
    }

    //console.log(data);

    openDialogView(element) {
        if (localStorage.getItem('lock')) {
            this.bloqueoService.unLockAll();
        }
        this.metodo = this.bloqueoService.search('locktresMenu', element.ormIdOrdmNumeroP).subscribe(data => {
            this.unSubcribeFirebase();
            if (data.length) {
                this.resultados = data;
                swal({
                    title: 'La autorización bloqueada',
                    text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
                    icon: 'info',
                });
            } else {
                this.dataLock.UserActive = new Userlock();
                this.dataLock.DateActive = element !== undefined && element !== null ? element.ormIdOrdmNumeroP : '';
                this.dataLock.UserActive.Documento = this.user.uid;
                this.dataLock.UserActive.Nombre = this.user.cn;
                this.valor = this.bloqueoService.lock(this.dataLock, 'locktresMenu');
                localStorage.setItem('lock', this.valor.key);
                localStorage.setItem('orden', JSON.stringify(element.ormIdOrdmNumero));
                const dialogRef = this.dialog.open(VerRadicarComponent, {
                    height: '500px',
                    data: element
                });
                dialogRef.afterClosed().subscribe((data) => {
                    this.bloqueoService.unLockAll();
                    this.initFilter();
                    this.onSubmit([2, 3]);
                });
                // this.bloqueoService.unLock('lockDerivaciones/');
            }
        });
    }

    getTime(date) {
        return 'Creadó ' + moment(date).fromNow();
    }

    getNumberHours(date) {
        if (moment(date).fromNow().includes('segundos')) {
            return 0;
        } else if (moment(date).fromNow().includes('minuto')) {
            return 0;
        } else if (moment(date).fromNow().includes('una')) {
            return 1;
        } else if (moment(date).fromNow().includes('mes')) {
            return 100;
        } else {
            return moment(date).fromNow().split(' ')[1];
        }
    }

    radicar(element) {
        this.dataLock.UserActive = new Userlock();
        this.dataLock.DateActive = element.ormIdOrdmNumero;
        this.dataLock.UserActive.Documento = this.user.uid;
        this.dataLock.UserActive.Nombre = this.user.cn;
        if (localStorage.getItem('lock')) {
            this.bloqueoService.unLockAll();
        }
        this.metodo = this.bloqueoService.search('lockRadica', this.dataLock.DateActive).subscribe(data => {
            this.unSubcribeFirebase();
            if (data.length) {
                this.resultados = data;
                swal({
                    title: 'Autorización bloqueada',
                    text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
                    icon: 'info',
                });
            } else {
                this.valor = this.bloqueoService.lock(this.dataLock, 'lockRadica');
                localStorage.setItem('lock', this.valor.key);
                localStorage.setItem('orden', JSON.stringify(element.ormIdOrdmNumero));
                this.router.navigate(['/radicar']);
            }
        });
    }

    openDialogAutorizacion(datoCita, modulo) {
        this.dataLock.UserActive = new Userlock();
        this.dataLock.DateActive = datoCita.idCita;
        this.dataLock.UserActive.Documento = this.user.uid;
        this.dataLock.UserActive.Nombre = this.user.cn;
        if (localStorage.getItem('lock')) {
            this.bloqueoService.unLockAll();
        }
        this.metodo = this.bloqueoService.search('lockAutorizacionPrueba', this.dataLock.DateActive).subscribe(data => {
            this.unSubcribeFirebase();
            if (data.length) {

                const TIEMPO_MAXIMO_DE_BLOQUEO_MINUTOS = 20;
                let bar: any = {};
                let aux1: number;
                console.log('Bloqueo, Por Favor Espere');
                console.log('data1: ', data);
                bar = data;
                if (bar[0] !== undefined) {
                    let now1 = new Date().getTime();
                    aux1 = (now1 - bar[0].DateBlocked) / (1200000);
                }
                console.log('Tiempo: ', aux1);
                if( aux1 >= 1 ){
                    console.log('El Bloqueo Supero El Limite');
                    console.log('El Tiempo Es > 1: ', aux1, ' ', TIEMPO_MAXIMO_DE_BLOQUEO_MINUTOS);
                    this.bloqueoService.geyKeyByIdCita('lockAutorizacionPrueba',
                    this.dataLock.DateActive).subscribe(metaData => {
                        console.log('metadata', metaData);
                        this.bloqueoService.unLockByKey('lockAutorizacionPrueba', metaData[0].key);
                    }).unsubscribe();
                    this.valor = this.bloqueoService.lock(this.dataLock, 'lockAutorizacionPrueba');
                    localStorage.setItem('lock', this.valor.key);
                    const dialogRef = this.dialog.open(RegistrarautorizacionCitaComponent, {
                        data: { datoCita },
                        height: '500px',
                        disableClose: true
                    });
                    dialogRef.afterClosed().subscribe((caGestionAutorizacionCita: CaGestionAutorizacionCita) => {
                        if (caGestionAutorizacionCita != null) {
                            this.citasPorAutorizar = null;
                            // this.onSubmitCitas();
                            this.bloqueoService.unLock('lockAutorizacionPrueba/');
                        }
                        if (caGestionAutorizacionCita === undefined) {
                            this.bloqueoService.unLock('lockAutorizacionPrueba/');
                        }
                        this.initFilter();
                        this.onSubmitCitas();
                    });


                }else{
                    this.resultados = data;
                    swal({
                        title: 'Autorización bloqueada',
                        text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
                        icon: 'info',
                    });
                }
            } else {
                this.valor = this.bloqueoService.lock(this.dataLock, 'lockAutorizacionPrueba');
                localStorage.setItem('lock', this.valor.key);
                const dialogRef = this.dialog.open(RegistrarautorizacionCitaComponent, {
                    data: { datoCita },
                    height: '500px',
                    disableClose: true
                });
                dialogRef.afterClosed().subscribe((caGestionAutorizacionCita: CaGestionAutorizacionCita) => {
                    if (caGestionAutorizacionCita != null) {
                        this.citasPorAutorizar = null;
                        // this.onSubmitCitas();
                        this.bloqueoService.unLock('lockAutorizacionPrueba/');
                    }
                    if (caGestionAutorizacionCita === undefined) {
                        this.bloqueoService.unLock('lockAutorizacionPrueba/');
                    }
                    this.initFilter();
                    this.onSubmitCitas();
                });
            }
        });
    }

    

    /*openDialogAutorizacion(datoCita, modulo) {
        this.dataLock.UserActive = new Userlock();
        this.dataLock.DateActive = datoCita.idCita;
        this.dataLock.UserActive.Documento = this.user.uid;
        this.dataLock.UserActive.Nombre = this.user.cn;
        if (localStorage.getItem('lock')) {
            this.bloqueoService.unLockAll();
        }
        
        this.metodo = this.bloqueoService.search('lockAutorizacion', this.dataLock.DateActive).subscribe(data => {
            this.unSubcribeFirebase();
            console.log(this.dataLock.DateActive);
            if (data.length) {
                this.resultados = data;
                swal({
                    title: 'Autorización bloqueada',
                    text: `Esta autorización se encuentra bloqueada por  ${this.resultados[0].UserActive.Nombre}`,
                    icon: 'info',
                });
            } else {
                this.valor = this.bloqueoService.lock(this.dataLock, 'lockAutorizacion');
                localStorage.setItem('lock', this.valor.key);
                const dialogRef = this.dialog.open(RegistrarautorizacionCitaComponent, {
                    data: { datoCita },
                    height: '500px',
                    disableClose: true
                });
                dialogRef.afterClosed().subscribe((caGestionAutorizacionCita: CaGestionAutorizacionCita) => {
                    if (caGestionAutorizacionCita != null) {
                        this.citasPorAutorizar = null;
                        // this.onSubmitCitas();
                        this.bloqueoService.unLock('lockAutorizacion/');
                    }
                    if (caGestionAutorizacionCita === undefined) {
                        this.bloqueoService.unLock('lockAutorizacion/');
                    }
                    this.initFilter();
                    this.onSubmitCitas();
                });
            }
        });
    }*/

    unSubcribeFirebase() {
        this.metodo.unsubscribe();
    }

}
// tslint:disable-next-line: max-line-length
// *ngIf="dataSourceRadicadas?.prestaciones !== dataSourceRadicadas?.continuidad && dataSourceRadicadas?.prestaciones && dataSourceRadicadas?.continuidad "
