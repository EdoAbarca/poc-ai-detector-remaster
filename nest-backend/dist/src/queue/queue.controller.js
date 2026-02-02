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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
let QueueController = class QueueController {
    queueService;
    constructor(queueService) {
        this.queueService = queueService;
    }
    async addUploadJob(data) {
        return this.queueService.addUploadJob(data);
    }
    async addDetectionJob(data) {
        return this.queueService.addDetectionJob(data);
    }
    async getUploadJobProgress(jobId) {
        const progress = await this.queueService.getUploadJobProgress(jobId);
        if (!progress) {
            return { error: 'Job not found' };
        }
        return progress;
    }
    async getDetectionJobProgress(jobId) {
        const progress = await this.queueService.getDetectionJobProgress(jobId);
        if (!progress) {
            return { error: 'Job not found' };
        }
        return progress;
    }
    async getUploadQueueStats() {
        return this.queueService.getUploadQueueStats();
    }
    async getDetectionQueueStats() {
        return this.queueService.getDetectionQueueStats();
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "addUploadJob", null);
__decorate([
    (0, common_1.Post)('detection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "addDetectionJob", null);
__decorate([
    (0, common_1.Get)('upload/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getUploadJobProgress", null);
__decorate([
    (0, common_1.Get)('detection/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getDetectionJobProgress", null);
__decorate([
    (0, common_1.Get)('stats/upload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getUploadQueueStats", null);
__decorate([
    (0, common_1.Get)('stats/detection'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getDetectionQueueStats", null);
exports.QueueController = QueueController = __decorate([
    (0, common_1.Controller)('queue'),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map