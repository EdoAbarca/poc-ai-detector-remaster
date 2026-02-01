import { Queue } from 'bullmq';
export interface UploadJobData {
    fileId: string;
    fileName: string;
    fileSize: number;
    userId: string;
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
export declare class QueueService {
    private readonly uploadQueue;
    private readonly detectionQueue;
    constructor(uploadQueue: Queue<UploadJobData>, detectionQueue: Queue<DetectionJobData>);
    addUploadJob(data: UploadJobData): Promise<{
        jobId: string | undefined;
        queueName: string;
    }>;
    addDetectionJob(data: DetectionJobData): Promise<{
        jobId: string | undefined;
        queueName: string;
    }>;
    getUploadJobProgress(jobId: string): Promise<JobProgress | null>;
    getDetectionJobProgress(jobId: string): Promise<JobProgress | null>;
    getUploadQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }>;
    getDetectionQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }>;
}
