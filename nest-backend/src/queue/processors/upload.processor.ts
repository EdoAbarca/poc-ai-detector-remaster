import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UploadJobData } from '../queue.service';

@Processor('upload-queue')
export class UploadProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadProcessor.name);

  async process(job: Job<UploadJobData>): Promise<any> {
    const { fileId, fileName, fileSize, userId } = job.data;

    this.logger.log(
      `Processing upload job ${job.id} for file: ${fileName} (${fileSize} bytes)`,
    );

    try {
      // Simulate file upload processing
      // In a real implementation, this would handle actual file upload logic
      
      // Update progress: Starting
      await job.updateProgress(0);
      this.logger.debug(`Upload started for file: ${fileName}`);

      // Simulate processing time and progress updates
      for (let i = 1; i <= 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await job.updateProgress(i * 10);
        this.logger.debug(`Upload progress for ${fileName}: ${i * 10}%`);
      }

      // Complete
      await job.updateProgress(100);
      this.logger.log(`Upload completed for file: ${fileName}`);

      return {
        success: true,
        fileId,
        message: `File ${fileName} uploaded successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process upload for file: ${fileName}`,
        error.stack,
      );
      throw error;
    }
  }
}
