import { QueueService } from './queue.service';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    addUploadJob(data: {
        fileId: string;
        fileName: string;
        fileSize: number;
        userId: string;
    }): Promise<{
        jobId: string | undefined;
        queueName: string;
    }>;
    addDetectionJob(data: {
        fileId: string;
        content: string;
        userId: string;
    }): Promise<{
        jobId: string | undefined;
        queueName: string;
    }>;
    getUploadJobProgress(jobId: string): Promise<import("./queue.service").JobProgress | {
        error: string;
    }>;
    getDetectionJobProgress(jobId: string): Promise<import("./queue.service").JobProgress | {
        error: string;
    }>;
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
