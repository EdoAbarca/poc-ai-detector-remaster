import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UploadJobData } from '../queue.service';
export declare class UploadProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<UploadJobData>): Promise<any>;
}
