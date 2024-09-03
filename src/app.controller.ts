import { Controller, Logger } from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { PDF_CREATED } from './config';

import { ZipServiceArchiver } from './modules/zip/zip-archiver.service';
import { IData } from './interfaces';
import { AwsService } from './modules/upload/aws.service';
import { Folders } from './enums';
import { PayloadDto } from './dto';

@Controller()
export class AppController {
  #logger = new Logger(AppController.name);
  constructor(
    private readonly compression: ZipServiceArchiver,
    private readonly awsService: AwsService,
  ) {}

  @MessagePattern(PDF_CREATED)
  async compresionFiles(@Payload() payload: PayloadDto) {
    const data = await this.compression.createInMemoryZipAndCleanup({
      data: payload.data as IData<any>,
    });

    this.awsService.uploadFile({
      zipFile: data,
      folder: Folders.PDF,
      fileName: 'pdfs.zip',
    });
    this.#logger.log('Compresion de archivos');
    return payload;
  }
}
