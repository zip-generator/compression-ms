import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsModule } from './modules/transports/nats.module';
@Module({
  imports: [NatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
