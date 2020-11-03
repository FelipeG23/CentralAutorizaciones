import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import { CookieService } from 'ngx-cookie-service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AutocompleteModule } from 'ng2-input-autocomplete';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore'; // << Note AngularFirestoreModule !!!
import { NgxCurrencyModule } from "ngx-currency";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './meterial';
import { LoginComponent } from './component/user/login/login.component';
import { CitasconsultaComponent } from './component/logeado/citasconsulta/citasconsulta.component';
import {MatDatepickerModule, MatExpansionModule, MatRadioModule, MatSort} from '@angular/material';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavbarSecondaryComponent } from './components/navbar-secondary/navbar-secondary.component';
import { CambiocitaComponent } from './modals/cambiocita/cambiocita.component';
import { EliminaromComponent } from './modals/eliminarom/eliminarom.component';
import { TrazaComponent } from './modals/traza/traza.component';
import { DetallepacienteComponent } from './modals/detallepaciente/detallepaciente.component';
import { OrdenmedicaComponent } from './component/logeado/ordenmedica/ordenmedica.component';
import { RadicaOrdenMedicaComponent } from './component/radica-orden-medica/radica-orden-medica.component';
import { GestionContinuidadComponent } from './component/logeado/gestion-continuidad/gestion-continuidad.component';
import { ConsultaconvenioComponent } from './component/logeado/consultaconvenio/consultaconvenio.component';
import { RegistrarautorizacionComponent } from './component/logeado/registrarautorizacion/registrarautorizacion.component';
import { AutorizarComponent } from './component/logeado/autorizar/autorizar.component';
import { InfoConvenioComponent } from './modals/info-convenio/info-convenio.component';
import { TrazaOrdenComponent } from './modals/trazaorden/trazaorden.component';
import { SelectPrestacionComponent } from './modals/select-prestacion/select-prestacion.component';
import {RegistrarautorizacionCitaComponent} from './component/logeado/registrarautorizacioncita/registrarautorizacioncita.component';
import { AngularFirestore } from '@angular/fire/firestore';
import {SelectCitaComponent} from './modals/select-cita/select-cita.component';
import { TrimPipe } from './pipes/trim.pipe';
import { VerRadicarComponent } from './modals/ver-radicar/ver-radicar.component';
import { VerDerivacionesComponent } from './modals/ver-derivaciones/ver-derivaciones.component';
import { DerivacionesComponent } from './component/logeado/derivaciones/derivaciones.component';
import { ImagenesdiagnosticasComponent } from './component/logeado/imagenesdiagnosticas/imagenesdiagnosticas.component';
import { CambiocitaImgComponent } from './modals/cambiocitaimg/cambiocitaimg.component';


export const customCurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  allowZero: true,
  decimal: ".",
  precision: 0,
  prefix: "$ ",
  suffix: "",
  thousands: ",",
  nullable: true
};



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CitasconsultaComponent,
    NavbarComponent,
    NavbarSecondaryComponent,
    CambiocitaComponent,
    CambiocitaImgComponent,
    EliminaromComponent,
    TrazaComponent,
    TrazaOrdenComponent,
    DetallepacienteComponent,
    OrdenmedicaComponent,
    RadicaOrdenMedicaComponent,
    GestionContinuidadComponent,
    ConsultaconvenioComponent,
    RegistrarautorizacionComponent,
    RegistrarautorizacionCitaComponent,
    AutorizarComponent,
    InfoConvenioComponent,
    SelectPrestacionComponent,
    SelectCitaComponent,
    TrimPipe,
    VerRadicarComponent,
    VerDerivacionesComponent,
    DerivacionesComponent,
    ImagenesdiagnosticasComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientModule,
        RecaptchaModule,
        NgxPaginationModule,
        NgxSpinnerModule,
        AutocompleteModule.forRoot(),
        MatExpansionModule,
        MatRadioModule,
        FormsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        AngularFirestoreModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig)
    ],
  entryComponents: [
    EliminaromComponent,
    CambiocitaComponent,
    CambiocitaImgComponent,
    TrazaComponent,
    TrazaOrdenComponent,
    DetallepacienteComponent,
    RadicaOrdenMedicaComponent,
    InfoConvenioComponent,
    RegistrarautorizacionComponent,
    RegistrarautorizacionCitaComponent, 
    SelectPrestacionComponent,
    VerDerivacionesComponent,
    SelectCitaComponent,
    VerRadicarComponent
  ],
  providers: [
    MatDatepickerModule,
    CookieService,
    AngularFirestore,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
