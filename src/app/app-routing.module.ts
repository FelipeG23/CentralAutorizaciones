import { ImagenesdiagnosticasComponent } from './component/logeado/imagenesdiagnosticas/imagenesdiagnosticas.component';
import { DerivacionesComponent } from './component/logeado/derivaciones/derivaciones.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './component/user/login/login.component';
import { CitasconsultaComponent } from './component/logeado/citasconsulta/citasconsulta.component';
import { AuthGuard } from './guard/auth.guard';
import { OrdenmedicaComponent } from './component/logeado/ordenmedica/ordenmedica.component';
import { RadicaOrdenMedicaComponent } from './component/radica-orden-medica/radica-orden-medica.component';
import { GestionContinuidadComponent } from './component/logeado/gestion-continuidad/gestion-continuidad.component';
import { RegistrarautorizacionComponent } from './component/logeado/registrarautorizacion/registrarautorizacion.component';
import { AutorizarComponent } from './component/logeado/autorizar/autorizar.component';
import { GestionBloqueos } from './component/logeado/gestionbloqueos/gestionbloqueos.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'citas',
    component: CitasconsultaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'derivaciones',
    component: DerivacionesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ordenes',
    component: OrdenmedicaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'radicar',
    component: RadicaOrdenMedicaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion',
    component: GestionContinuidadComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'autorizacion',
    component: AutorizarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'registrarautorizacion',
    component: RegistrarautorizacionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'imagenesdiagnosticas',
    component: ImagenesdiagnosticasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionbloqueos',
    component: GestionBloqueos,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
