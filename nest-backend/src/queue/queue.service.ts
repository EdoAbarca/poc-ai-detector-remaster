import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface UploadJobData {
  documentId: number;
  filePath: string;
  mimetype: string;
  originalName: string;
}

export interface DetectionJobData {
  fileId: string;
  content: string;
  userId: string;
}

export interface JobProgress {
  percentage: number;
  status: string;
  message?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('upload-queue')
    private readonly uploadQueue: Queue<UploadJobData>,
    @InjectQueue('detection-queue')
    private readonly detectionQueue: Queue<DetectionJobData>,
  ) {}

  /**
   * Add a file upload job to the upload queue
   */
  async addUploadJob(data: UploadJobData) {
    const job = await this.uploadQueue.add('upload-file', data, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    return {
      jobId: job.id,
      queueName: 'upload-queue',
    };
  }

  /**
   * Add an AI detection job to the detection queue
   */
  async addDetectionJob(data: DetectionJobData) {
    const job = await this.detectionQueue.add('detect-ai', data, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    return {
      jobId: job.id,
      queueName: 'detection-queue',
    };
  }

  /**
   * Get the progress of an upload job
   */
  async getUploadJobProgress(jobId: string): Promise<JobProgress | null> {
    const job = await this.uploadQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress as number;

    return {
      percentage: progress || 0,
      status: state,
      message: job.returnvalue || undefined,
    };
  }

  /**
   * Get the progress of a detection job
   */
  async getDetectionJobProgress(jobId: string): Promise<JobProgress | null> {
    const job = await this.detectionQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress as number;

    return {
      percentage: progress || 0,
      status: state,
      message: job.returnvalue || undefined,
    };
  }

  /**
   * Get queue statistics
   */
  async getUploadQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.uploadQueue.getWaitingCount(),
      this.uploadQueue.getActiveCount(),
      this.uploadQueue.getCompletedCount(),
      this.uploadQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Get queue statistics
   */
  async getDetectionQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.detectionQueue.getWaitingCount(),
      this.detectionQueue.getActiveCount(),
      this.detectionQueue.getCompletedCount(),
      this.detectionQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
