export interface GestionAutorizacionCita {
    cgIdCitaNumero: number;
    pacPacNumero: number;
    gauNombreAutorizador: string;
    gauTelefonoAutorizador: string;
    gauAutorizaServ: string;
    gauAutorizaConv: string;
    mnaIdCodigo: number;
    omnDesc: string;
    gauCodigoAutorizacion: string;
    gauFechaAutorizacion: Date;
    gauFechaVencimientoAutorizacion: Date;
    gauVigenciaAutorizacion: number;
    gauValorPrestacion: number;
    gauCostoConvenio: number;
    gauCostoPac: number;
    pcaAgeCodigoRecep: string;
    gauFechaProceso: Date;
    ogaDescripcion: string;
}