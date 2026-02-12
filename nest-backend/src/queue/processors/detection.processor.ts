import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DetectionJobData } from '../queue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DetectService } from '../../detect/detect.service';

@Processor('detection-queue')
export class DetectionProcessor extends WorkerHost {
  private readonly logger = new Logger(DetectionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly detectService: DetectService,
  ) {
    super();
  }

  async process(job: Job<DetectionJobData>): Promise<any> {
    const { fileId, content, userId } = job.data;

    this.logger.log(
      `Processing AI detection job ${job.id} for file: ${fileId}`,
    );

    try {
      // Fetch document from database
      const document = await this.prisma.document.findUnique({
        where: { id: parseInt(fileId) },
        include: { scan: true },
      });

      if (!document) {
        throw new Error(`Document not found: ${fileId}`);
      }

      const chunks = document.textChunks || [];
      if (chunks.length === 0) {
        this.logger.warn(`No text chunks found for document: ${fileId}`);
        return {
          success: false,
          fileId,
          message: 'No text chunks to analyze',
        };
      }

      this.logger.log(`Analyzing ${chunks.length} chunks for document: ${fileId}`);

      // Update progress: Starting
      await job.updateProgress({
        percentage: 0,
        currentDoc: document.name,
        status: 'Starting analysis...',
        chunksProcessed: 0,
        totalChunks: chunks.length,
      });

      // Process each chunk with Fast-Detect-GPT
      const chunkResults: Array<{
        id: number;
        documentId: number;
        chunkIndex: number;
        chunkText: string;
        aiScore: number;
        aiResult: string;
        criterion: number;
        model: string;
        createdAt: Date;
      }> = [];
      
      let lastReportedProgress = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const progressPercent = Math.round(((i + 1) / chunks.length) * 90); // Reserve last 10% for aggregation

        this.logger.debug(`Processing chunk ${i + 1}/${chunks.length} for document: ${fileId}`);

        // Call Fast-Detect-GPT service
        const detectionResult = await this.detectService.detectWithFastDetectGPT({
          text: chunk,
        });

        // Store result in database
        const result = await this.prisma.result.create({
          data: {
            documentId: parseInt(fileId),
            chunkIndex: i,
            chunkText: chunk,
            aiScore: detectionResult.ai_score,
            aiResult: detectionResult.ai_result,
            criterion: detectionResult.criterion,
            model: 'fast-detect-gpt',
          },
        });

        chunkResults.push(result);

        // Update progress every 5% or on every chunk if there are few chunks
        if (progressPercent - lastReportedProgress >= 5 || chunks.length <= 20) {
          await job.updateProgress({
            percentage: progressPercent,
            currentDoc: document.name,
            status: `Processing chunk ${i + 1} of ${chunks.length}...`,
            chunksProcessed: i + 1,
            totalChunks: chunks.length,
          });
          lastReportedProgress = progressPercent;
        }
      }

      // Aggregate results
      await job.updateProgress({
        percentage: 95,
        currentDoc: document.name,
        status: 'Aggregating results...',
        chunksProcessed: chunks.length,
        totalChunks: chunks.length,
      });
      this.logger.log(`Aggregating results for document: ${fileId}`);

      const avgAiScore = chunkResults.reduce((sum, r) => sum + r.aiScore, 0) / chunkResults.length;
      const avgCriterion = chunkResults.reduce((sum, r) => sum + r.criterion, 0) / chunkResults.length;
      const aiChunks = chunkResults.filter(r => r.aiResult === 'AI').length;
      const humanChunks = chunkResults.filter(r => r.aiResult === 'Human').length;
      const overallResult = aiChunks > humanChunks ? 'AI' : 'Human';

      // Complete
      await job.updateProgress({
        percentage: 100,
        currentDoc: document.name,
        status: 'Analysis complete',
        chunksProcessed: chunks.length,
        totalChunks: chunks.length,
      });
      this.logger.log(
        `AI detection completed for document: ${fileId} - Result: ${overallResult} (${avgAiScore.toFixed(2)}% AI confidence, ${chunkResults.length} chunks analyzed)`,
      );

      return {
        success: true,
        fileId,
        documentId: document.id,
        result: {
          overallResult,
          avgAiScore,
          avgCriterion,
          totalChunks: chunkResults.length,
          aiChunks,
          humanChunks,
        },
        message: 'AI detection completed successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to process AI detection for file: ${fileId}`,
        error.stack,
      );
      throw error;
    }
  }
}
