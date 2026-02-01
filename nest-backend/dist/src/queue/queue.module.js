"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const nestjs_1 = require("@bull-board/nestjs");
const express_1 = require("@bull-board/express");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const upload_processor_1 = require("./processors/upload.processor");
const detection_processor_1 = require("./processors/detection.processor");
const queue_service_1 = require("./queue.service");
const queue_controller_1 = require("./queue.controller");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'redis',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                },
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'upload-queue',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'detection-queue',
            }),
            nestjs_1.BullBoardModule.forRoot({
                route: '/queues',
                adapter: express_1.ExpressAdapter,
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'upload-queue',
                adapter: bullMQAdapter_1.BullMQAdapter,
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'detection-queue',
                adapter: bullMQAdapter_1.BullMQAdapter,
            }),
        ],
        controllers: [queue_controller_1.QueueController],
        providers: [upload_processor_1.UploadProcessor, detection_processor_1.DetectionProcessor, queue_service_1.QueueService],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map