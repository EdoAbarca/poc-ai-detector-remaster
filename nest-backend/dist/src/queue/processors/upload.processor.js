"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UploadProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let UploadProcessor = UploadProcessor_1 = class UploadProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(UploadProcessor_1.name);
    async process(job) {
        const { fileId, fileName, fileSize, userId } = job.data;
        this.logger.log(`Processing upload job ${job.id} for file: ${fileName} (${fileSize} bytes)`);
        try {
            await job.updateProgress(0);
            this.logger.debug(`Upload started for file: ${fileName}`);
            for (let i = 1; i <= 10; i++) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await job.updateProgress(i * 10);
                this.logger.debug(`Upload progress for ${fileName}: ${i * 10}%`);
            }
            await job.updateProgress(100);
            this.logger.log(`Upload completed for file: ${fileName}`);
            return {
                success: true,
                fileId,
                message: `File ${fileName} uploaded successfully`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process upload for file: ${fileName}`, error.stack);
            throw error;
        }
    }
};
exports.UploadProcessor = UploadProcessor;
exports.UploadProcessor = UploadProcessor = UploadProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('upload-queue')
], UploadProcessor);
//# sourceMappingURL=upload.processor.js.map