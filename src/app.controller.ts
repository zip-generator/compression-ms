import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PDF_CREATED } from './config';
import { DataGroupedByDate } from './modules/dto/payload.dto';

@Controller()
export class AppController {
  #logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @MessagePattern(PDF_CREATED)
  compresionFiles(@Payload() payload: DataGroupedByDate) {
    this.#logger.log('Compresion de archivos');
    return payload;
  }
}
