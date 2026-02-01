import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DetectionJobData } from '../queue.service';

@Processor('detection-queue')
export class DetectionProcessor extends WorkerHost {
  private readonly logger = new Logger(DetectionProcessor.name);

  async process(job: Job<DetectionJobData>): Promise<any> {
    const { fileId, content, userId } = job.data;

    this.logger.log(
      `Processing AI detection job ${job.id} for file: ${fileId}`,
    );

    try {
      // Update progress: Starting
      await job.updateProgress(0);
      this.logger.debug(`AI detection started for file: ${fileId}`);

      // Simulate AI detection processing stages
      const stages = [
        { progress: 20, message: 'Preprocessing text...' },
        { progress: 40, message: 'Loading detection models...' },
        { progress: 60, message: 'Running AI detection analysis...' },
        { progress: 80, message: 'Computing confidence scores...' },
        { progress: 90, message: 'Finalizing results...' },
      ];

      for (const stage of stages) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await job.updateProgress(stage.progress);
        this.logger.debug(`${stage.message} (${stage.progress}%)`);
      }

      // In a real implementation, this would call the fast-detect-gpt service
      // For now, simulate a detection result
      const detectionResult = {
        isAiGenerated: Math.random() > 0.5,
        confidence: Math.random(),
        model: 'fast-detect-gpt',
      };

      // Complete
      await job.updateProgress(100);
      this.logger.log(
        `AI detection completed for file: ${fileId} - Result: ${detectionResult.isAiGenerated ? 'AI-generated' : 'Human-written'} (${(detectionResult.confidence * 100).toFixed(2)}% confidence)`,
      );

      return {
        success: true,
        fileId,
        result: detectionResult,
        message: 'AI detection completed successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to process AI detection for file: ${fileId}`,
        error.stack,
      );
      throw error;
    }
  }
}
