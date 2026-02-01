import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('upload')
  async addUploadJob(
    @Body()
    data: {
      fileId: string;
      fileName: string;
      fileSize: number;
      userId: string;
    },
  ) {
    return this.queueService.addUploadJob(data);
  }

  @Post('detection')
  async addDetectionJob(
    @Body()
    data: {
      fileId: string;
      content: string;
      userId: string;
    },
  ) {
    return this.queueService.addDetectionJob(data);
  }

  @Get('upload/:jobId')
  async getUploadJobProgress(@Param('jobId') jobId: string) {
    const progress = await this.queueService.getUploadJobProgress(jobId);
    if (!progress) {
      return { error: 'Job not found' };
    }
    return progress;
  }

  @Get('detection/:jobId')
  async getDetectionJobProgress(@Param('jobId') jobId: string) {
    const progress = await this.queueService.getDetectionJobProgress(jobId);
    if (!progress) {
      return { error: 'Job not found' };
    }
    return progress;
  }

  @Get('stats/upload')
  async getUploadQueueStats() {
    return this.queueService.getUploadQueueStats();
  }

  @Get('stats/detection')
  async getDetectionQueueStats() {
    return this.queueService.getDetectionQueueStats();
  }
}
