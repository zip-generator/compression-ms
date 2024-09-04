/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Archiver from 'archiver';
import * as path from 'path';
import { IData } from '../../interfaces';
import { RpcException } from '@nestjs/microservices';
import { PassThrough } from 'stream';

interface IZipProps<T> {
  data: IData<T>;
}
@Injectable()
export class ZipServiceArchiver {
  #logger = new Logger(ZipServiceArchiver.name);

  async createInMemoryZipAndCleanup<T>({
    data,
  }: IZipProps<T>): Promise<Buffer> {
    try {
      this.#logger.warn('Creating zip file...');
      const zipBuffer = await this.createZipInMemory<T>({ data });
      this.#logger.log('Zip file created successfully');

      return zipBuffer;
    } catch (error) {
      this.#logger.warn(
        'Error creating zip file in createInMemoryZipAndCleanup:',
        { error },
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating zip file',
      });
    }
  }

  private async createZipInMemory<T>({ data }: IZipProps<T>): Promise<Buffer> {
    this.#logger.warn('Creating zip in memory...');

    const archive = Archiver('zip', { zlib: { level: 9 } });
    const buffers: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => buffers.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(buffers)));
      archive.on('error', (error) => {
        this.#logger.error('Error creating zip file:', error);
        reject(error);
      });
      // Add files to the archive
      for (const dateKey in data) {
        this.#logger.log('Processing dateKey:', dateKey);
        const clientData: T[] = data[dateKey];
        for (const tipoDte in clientData) {
          for (const file of clientData[tipoDte] as T[]) {
            const fileName = `${file?.['identificacion']?.['codigoGeneracion']}.pdf`;
            const fileContent = file?.['buffer'] ?? Buffer.alloc(0);

            archive.append(Buffer.from(fileContent), {
              name: path.join(dateKey.toString(), tipoDte.toString(), fileName),
            });
          }
        }
      }
      this.#logger.warn('Finalizing archive...');
      return archive.finalize();
    });
  }
  private async createZipStream<T>({ data }: IZipProps<T>): Promise<Buffer> {
    this.#logger.warn('Creating zip in stream...');

    const archive = Archiver('zip', { zlib: { level: 9 } });
    const passThrough = new PassThrough(); // Utilizamos PassThrough para manejar los datos de salida
    const buffers: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      passThrough.on('data', (chunk: Buffer) => buffers.push(chunk));
      passThrough.on('end', () => resolve(Buffer.concat(buffers)));
      passThrough.on('error', (error) => {
        this.#logger.error('Error creating zip file:', error);
        reject(error);
      });

      archive.pipe(passThrough);

      // Añadir archivos al archivo zip
      for (const dateKey in data) {
        this.#logger.log('Processing dateKey:', dateKey);
        const clientData: T[] = data[dateKey];
        for (const tipoDte in clientData) {
          for (const file of clientData[tipoDte] as T[]) {
            const fileName = `${file?.['identificacion']?.['codigoGeneracion']}.pdf`;
            const fileContent = file?.['buffer'] ?? Buffer.alloc(0);

            archive.append(fileContent, {
              name: path.join(dateKey.toString(), tipoDte.toString(), fileName),
            });
          }
        }
      }

      this.#logger.warn('Finalizing archive...');
      archive.finalize();
    });
  }
}
