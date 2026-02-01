import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [QueueModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
