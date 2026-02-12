import { Module, forwardRef } from '@nestjs/common';
import { DetectController } from './detect.controller';
import { DetectService } from './detect.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [DetectController],
  providers: [DetectService],
  exports: [DetectService],
})
export class DetectModule {}
