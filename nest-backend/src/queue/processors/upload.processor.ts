import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { UploadJobData } from '../queue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentExtractionService } from '../../scan/document-extraction.service';

@Processor('upload-queue')
@Injectable()
export class UploadProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentExtraction: DocumentExtractionService,
  ) {
    super();
  }

  async process(job: Job<UploadJobData>): Promise<any> {
    const { documentId, filePath, mimetype, originalName } = job.data;

    this.logger.log(
      `Processing upload job ${job.id} for document: ${originalName} (ID: ${documentId})`,
    );

    try {
      // Update progress: Upload received (0% - instant when job starts)
      await job.updateProgress(0);

      // Update status to processing
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: 'processing' },
      });

      // Update progress: Starting extraction
      await job.updateProgress(20);
      this.logger.debug(`Starting text extraction for document: ${originalName}`);

      // Extract text and split into chunks
      const { text, chunks } = await this.documentExtraction.extractAndChunk(
        filePath,
        mimetype,
      );

      // Update progress: Extraction complete
      await job.updateProgress(70);
      this.logger.debug(
        `Text extraction complete: ${text.length} characters, ${chunks.length} chunks`,
      );

      // Save extracted text and chunks to database
      await job.updateProgress(85);
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText: text,
          textChunks: chunks,
          processingStatus: 'completed',
          processingError: null,
        },
      });

      // Complete
      await job.updateProgress(100);
      this.logger.log(
        `Document processing completed for: ${originalName} (${chunks.length} chunks)`,
      );

      return {
        success: true,
        documentId,
        textLength: text.length,
        chunkCount: chunks.length,
        message: `Document ${originalName} processed successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process document: ${originalName}`,
        error.stack,
      );

      // Update document status to failed
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: 'failed',
          processingError: error.message,
        },
      });

      throw error;
    }
  }
}
