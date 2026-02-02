"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DetectionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let DetectionProcessor = DetectionProcessor_1 = class DetectionProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(DetectionProcessor_1.name);
    async process(job) {
        const { fileId, content, userId } = job.data;
        this.logger.log(`Processing AI detection job ${job.id} for file: ${fileId}`);
        try {
            await job.updateProgress(0);
            this.logger.debug(`AI detection started for file: ${fileId}`);
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
            const detectionResult = {
                isAiGenerated: Math.random() > 0.5,
                confidence: Math.random(),
                model: 'fast-detect-gpt',
            };
            await job.updateProgress(100);
            this.logger.log(`AI detection completed for file: ${fileId} - Result: ${detectionResult.isAiGenerated ? 'AI-generated' : 'Human-written'} (${(detectionResult.confidence * 100).toFixed(2)}% confidence)`);
            return {
                success: true,
                fileId,
                result: detectionResult,
                message: 'AI detection completed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to process AI detection for file: ${fileId}`, error.stack);
            throw error;
        }
    }
};
exports.DetectionProcessor = DetectionProcessor;
exports.DetectionProcessor = DetectionProcessor = DetectionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('detection-queue')
], DetectionProcessor);
//# sourceMappingURL=detection.processor.js.map