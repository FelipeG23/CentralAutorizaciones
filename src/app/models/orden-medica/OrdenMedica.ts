import { DetalleOrdenMedica } from './DetalleOrdenMedica';
import { CaPrestacionesOrdMed } from './CaPrestacionesOrdMed';

export class OrdenMedica {

    ormIdOrdmNumero: number;
	pacPacNumero: number;
	pacPacTipoIdentCodigo: string;
    tipTipIDav: string;
	pacPacRut: string;
	pcaAgeCodigoRecep: string;
	cgFechaProceso: string;
    ormFilename: string;
    eomIdCodigo: number;
    nombreCompletoPaciente: string;
    caDetalleOrdenesMedicas: DetalleOrdenMedica;
    caPrestacionesOrdMed: CaPrestacionesOrdMed[] = [];
    fechaRegistroFile: string;
}
