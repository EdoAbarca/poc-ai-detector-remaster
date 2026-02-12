import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { UploadProcessor } from './processors/upload.processor';
import { DetectionProcessor } from './processors/detection.processor';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ScanModule } from '../scan/scan.module';
import { DetectModule } from '../detect/detect.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ScanModule),
    DetectModule,
    // Configure BullMQ with Redis connection
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    // Register the upload queue
    BullModule.registerQueue({
      name: 'upload-queue',
    }),
    // Register the detection queue
    BullModule.registerQueue({
      name: 'detection-queue',
    }),
    // Configure Bull Board for monitoring
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'upload-queue',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'detection-queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [QueueController],
  providers: [UploadProcessor, DetectionProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
