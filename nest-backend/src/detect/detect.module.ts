import { Module } from '@nestjs/common';
import { DetectController } from './detect.controller';
import { DetectService } from './detect.service';

@Module({
  controllers: [DetectController],
  providers: [DetectService],
  exports: [DetectService],
})
export class DetectModule {}
