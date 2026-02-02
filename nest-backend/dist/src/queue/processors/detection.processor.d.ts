import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DetectionJobData } from '../queue.service';
export declare class DetectionProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<DetectionJobData>): Promise<any>;
}
