import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { DetectService } from './detect.service';
import { CreateDetectDto } from './dto/create-detect.dto';
import { QueueService } from '../queue/queue.service';

@Controller('api/v1/detect')
export class DetectController {
  constructor(
    private readonly detectService: DetectService,
    private readonly queueService: QueueService,
  ) {}

  @Post('fast-detect-gpt')
  @HttpCode(HttpStatus.OK)
  async detectWithFastDetectGPT(
    @Body(new ValidationPipe({ whitelist: true })) createDetectDto: CreateDetectDto,
  ) {
    return this.detectService.detectWithFastDetectGPT(createDetectDto);
  }

  @Get('progress/:jobId')
  @HttpCode(HttpStatus.OK)
  async getDetectionProgress(@Param('jobId') jobId: string) {
    const progress = await this.queueService.getDetectionJobProgress(jobId);
    if (!progress) {
      throw new NotFoundException('Detection job not found');
    }
    return progress;
  }
}
