export interface IData<T> {
  [key: string]: T[];
}

export interface IGroupedData {
  [key: string]: InvoiceType;
}

export interface InvoiceType {
  [key: string]: InvoiceData[];
}

export interface InvoiceData {
  buffer: string;
  identificacion: Identificacion;
}

export interface Identificacion {
  fecEmi: Date;
  horEmi: string;
  tipoDte: string;
  version: number;
  ambiente: string;
  tipoModelo: number;
  tipoMoneda: string;
  motivoContin: null;
  numeroControl: string;
  tipoOperacion: number;
  codigoGeneracion: string;
  tipoContingencia: null;
}
