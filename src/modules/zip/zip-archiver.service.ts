/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { IData } from '../../interfaces';
import { RpcException } from '@nestjs/microservices';
import { PassThrough } from 'stream';

interface IZipProps<T> {
  data: IData<T>;
  jobId: string;
}
@Injectable()
export class ZipServiceArchiver {
  #logger = new Logger(ZipServiceArchiver.name);

  async createInMemoryZipAndCleanup<T>({
    data,
    jobId,
  }: IZipProps<T>): Promise<Buffer> {
    try {
      this.#logger.warn('Creating zip file...');
      const zipBuffer = await this.createZipStream<T>({ data, jobId });
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

  private async createZipStream<T>({
    data,
    jobId,
  }: IZipProps<T>): Promise<Buffer> {
    this.#logger.warn('Creating zip in stream...');

    const archive = Archiver('zip', { zlib: { level: 9 } });
    const passThrough = new PassThrough(); // Utilizamos PassThrough para manejar los datos de salida
    const buffers: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      passThrough.on('data', (chunk: Buffer) => buffers.push(chunk));
      passThrough.on('end', async () => {
        await this.cleanUpTempFolder(jobId);
        resolve(Buffer.concat(buffers));
      });
      passThrough.on('error', (error) => {
        this.#logger.error('Error creating zip file:', error);
        reject(error);
      });

      archive.pipe(passThrough);

      // Añadir archivos al archivo zip
      for (const dateKey in data) {
        const clientData: T[] = data[dateKey];
        for (const tipoDte in clientData) {
          for (const file of clientData[tipoDte] as T[]) {
            const fileName = `${file?.['identificacion']?.['codigoGeneracion']}.pdf`;
            const filePath = path.join(
              process.cwd(),
              'temp-data',
              jobId,
              fileName,
            );
            const fileStream = fs.createReadStream(filePath);
            archive.append(fileStream, {
              name: path.join(dateKey.toString(), tipoDte.toString(), fileName),
            });
          }
        }
      }

      this.#logger.warn('Finalizing archive...');
      archive.finalize();
    });
  }
  private async cleanUpTempFolder(folderPath: string): Promise<void> {
    try {
      const fullFolderPath = path.join(process.cwd(), 'temp-data', folderPath); // Ruta completa de la carpeta
      await fsPromises.rm(fullFolderPath, { recursive: true, force: true });
      this.#logger.log(`Temporary folder cleaned up: ${fullFolderPath}`);
    } catch (err) {
      this.#logger.error(
        `Error cleaning up temporary folder: ${folderPath}`,
        err,
      );
    }
  }
}
