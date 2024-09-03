import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsModule } from './modules/transports/nats.module';
import { UploadModule } from './modules/upload/upload.module';
@Module({
  imports: [NatsModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [UploadModule],
})
export class AppModule {}
