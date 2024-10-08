import { Controller, Logger, HttpStatus } from '@nestjs/common';

import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PDF_CREATED, ZIP_COMPLETED } from './config';

import { ZipServiceArchiver } from './modules/zip/zip-archiver.service';
import { AwsService } from './modules/upload/aws.service';
import { Folders } from './enums';
import { PayloadDto } from './dto';
import { getRandomUuid, readFileFromPath, rmFile } from './utils';
const delimiter = '-';

@Controller()
export class AppController {
  #logger = new Logger(AppController.name);
  constructor(
    private readonly compression: ZipServiceArchiver,
    private readonly awsService: AwsService,
  ) {}

  @MessagePattern(PDF_CREATED)
  async compresionFiles(@Payload() payload: PayloadDto) {
    try {
      this.#logger.debug('compressing files', {});
      const dataFromFile = await readFileFromPath(payload.data.fileName);
      const data = await this.compression.createInMemoryZipAndCleanup({
        data: dataFromFile,
        jobId: payload.jobId.toString(),
      });

      this.#logger.debug('uploading file to s3');
      const fileName = `${payload.jobId}${delimiter}${getRandomUuid()}.zip`;
      const response = await this.awsService.uploadFile({
        zipFile: data,
        folder: Folders.PDF,
        fileName,
      });
      this.#logger.debug('file uploaded to s3', {});
      await rmFile(payload.data.fileName);
      return {
        message: 'Files compressed and uploaded to S3',
        status: HttpStatus.OK,
        data: {
          ok: true,
          awsKey: response.key,
        },
      };
    } catch (error) {
      this.#logger.error('error compressing files', { error });
      throw new RpcException(error);
    }
  }

  @MessagePattern(ZIP_COMPLETED)
  async getZip(@Payload('key') key: string): Promise<string> {
    return await this.awsService.downloadFile(key);
  }
}
