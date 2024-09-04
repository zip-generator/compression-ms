import { Controller, Logger, HttpStatus } from '@nestjs/common';

import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PDF_CREATED } from './config';

import { ZipServiceArchiver } from './modules/zip/zip-archiver.service';
import { AwsService } from './modules/upload/aws.service';
import { Folders } from './enums';
import { PayloadDto } from './dto';
import { getRandomUuid } from './utils';
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
      const data: Buffer = await this.compression.createInMemoryZipAndCleanup({
        data: payload.data.data,
      });

      this.#logger.debug('uploading file to s3');
      await this.awsService.uploadFile({
        zipFile: data,
        folder: Folders.PDF,
        fileName: `${payload.jobId}${delimiter}${getRandomUuid()}.zip`,
      });
      return {
        message: 'Files compressed and uploaded to S3',
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.#logger.error('error compressing files', { error });
      throw new RpcException(error);
    }
  }
}
