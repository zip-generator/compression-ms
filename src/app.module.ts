import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsModule } from './modules/transports/nats.module';
import { UploadModule } from './modules/upload/upload.module';
import { ZipModule } from './modules/zip/zip.module';
@Module({
  imports: [NatsModule, UploadModule, ZipModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [UploadModule],
})
export class AppModule {}
