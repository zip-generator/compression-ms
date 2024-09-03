interface ProcessedData {
  buffer: Buffer;
  identificacion: object;
}

// Define el tipo del grupo por fecha y tipo
interface DataGroupedByDate {
  [fecha: string]: {
    [tipoDte: string]: ProcessedData[];
  };
}
export { ProcessedData, DataGroupedByDate };
