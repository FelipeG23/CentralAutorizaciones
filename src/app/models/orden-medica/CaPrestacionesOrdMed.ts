import { GestionContinuidad } from '../gestion-continuidad/GestionContinuidad';
import { CaGestionAutorizacion } from './CaGestionAutorizacion';

export class CaPrestacionesOrdMed {
	pomIdPrestOrdm:number;
	ormIdOrdmNumero: number;
	serSerCodigo: string;
	serSerDesc: string;
	prePreCodigo: string;
	prePreDesc: string;
	pcaAgeCodigRecep: string;
	caTrazaGestContinuidad:GestionContinuidad;
	caGestionAutorizacion:CaGestionAutorizacion;
}