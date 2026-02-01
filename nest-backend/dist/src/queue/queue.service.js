"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let QueueService = class QueueService {
    uploadQueue;
    detectionQueue;
    constructor(uploadQueue, detectionQueue) {
        this.uploadQueue = uploadQueue;
        this.detectionQueue = detectionQueue;
    }
    async addUploadJob(data) {
        const job = await this.uploadQueue.add('upload-file', data, {
            removeOnComplete: true,
            removeOnFail: false,
        });
        return {
            jobId: job.id,
            queueName: 'upload-queue',
        };
    }
    async addDetectionJob(data) {
        const job = await this.detectionQueue.add('detect-ai', data, {
            removeOnComplete: true,
            removeOnFail: false,
        });
        return {
            jobId: job.id,
            queueName: 'detection-queue',
        };
    }
    async getUploadJobProgress(jobId) {
        const job = await this.uploadQueue.getJob(jobId);
        if (!job) {
            return null;
        }
        const state = await job.getState();
        const progress = job.progress;
        return {
            percentage: progress || 0,
            status: state,
            message: job.returnvalue || undefined,
        };
    }
    async getDetectionJobProgress(jobId) {
        const job = await this.detectionQueue.getJob(jobId);
        if (!job) {
            return null;
        }
        const state = await job.getState();
        const progress = job.progress;
        return {
            percentage: progress || 0,
            status: state,
            message: job.returnvalue || undefined,
        };
    }
    async getUploadQueueStats() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.uploadQueue.getWaitingCount(),
            this.uploadQueue.getActiveCount(),
            this.uploadQueue.getCompletedCount(),
            this.uploadQueue.getFailedCount(),
        ]);
        return { waiting, active, completed, failed };
    }
    async getDetectionQueueStats() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.detectionQueue.getWaitingCount(),
            this.detectionQueue.getActiveCount(),
            this.detectionQueue.getCompletedCount(),
            this.detectionQueue.getFailedCount(),
        ]);
        return { waiting, active, completed, failed };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('upload-queue')),
    __param(1, (0, bullmq_1.InjectQueue)('detection-queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue])
], QueueService);
//# sourceMappingURL=queue.service.js.map