interface ProcessedData {
  buffer: Buffer;
  identificacion: object;
}

// Define el tipo del grupo por fecha y tipo
export interface IData {
  [key: string]: ProcessedData[];
}

export { ProcessedData };
