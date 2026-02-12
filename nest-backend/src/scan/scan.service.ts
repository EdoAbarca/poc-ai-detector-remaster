import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScanDto, CreateScanWithFilesDto } from './dto/create-scan.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ScanService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async createScan(userId: number, createScanDto: CreateScanDto) {
    const { title, content, aiProviders, tags } = createScanDto;

    // First, get or create tags
    const tagObjects = tags
      ? await Promise.all(
          tags.map(async (tagName) => {
            return this.prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          }),
        )
      : [];

    // Create the scan with tags
    const scan = await this.prisma.scan.create({
      data: {
        title,
        content,
        aiProviders: aiProviders || [],
        userId,
        tags: {
          connect: tagObjects.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });

    return scan;
  }

  async createScanWithFiles(
    userId: number,
    createScanDto: CreateScanWithFilesDto,
    files: Express.Multer.File[],
  ) {
    const { title, aiProviders, tags } = createScanDto;

    // First, get or create tags
    const tagObjects = tags
      ? await Promise.all(
          tags.map(async (tagName) => {
            return this.prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          }),
        )
      : [];

    // Create the scan with tags and documents
    const scan = await this.prisma.scan.create({
      data: {
        title,
        aiProviders: aiProviders || [],
        userId,
        tags: {
          connect: tagObjects.map((tag) => ({ id: tag.id })),
        },
        documents: {
          create: files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            processingStatus: 'pending',
          })),
        },
      },
      include: {
        tags: true,
        documents: true,
      },
    });

    // Queue document processing jobs for each uploaded file
    const jobPromises = scan.documents.map((document) =>
      this.queueService.addUploadJob({
        documentId: document.id,
        filePath: document.path,
        mimetype: document.mimetype,
        originalName: document.originalName,
      }),
    );

    const jobs = await Promise.all(jobPromises);

    // Map job IDs to documents for progress tracking
    const documentsWithJobIds = scan.documents.map((doc, index) => ({
      ...doc,
      jobId: jobs[index].jobId,
    }));

    return {
      ...scan,
      documents: documentsWithJobIds,
    };
  }

  async getUserScans(userId: number) {
    const scans = await this.prisma.scan.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return scans;
  }

  async getScanById(scanId: number, userId: number) {
    const scan = await this.prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
      include: {
        tags: true,
      },
    });

    if (!scan) {
      return null;
    }

    // Mock documents and AI detection results for now
    // In a real implementation, these would come from related tables
    const mockDocuments = [
      {
        id: 1,
        name: `${scan.title} - Document 1`,
        aiScore: 0.23,
        classification: 'Human',
        detectedBy: scan.aiProviders.length > 0 ? scan.aiProviders[0] : 'GPT-4',
        content: scan.content || 'Sample content for analysis...',
      },
    ];

    // If there are multiple AI providers, create results for each
    if (scan.aiProviders.length > 1) {
      mockDocuments.push({
        id: 2,
        name: `${scan.title} - Document 2`,
        aiScore: 0.87,
        classification: 'AI',
        detectedBy: scan.aiProviders[1],
        content: 'Another sample content analyzed by different AI provider...',
      });
    }

    return {
      ...scan,
      documents: mockDocuments,
    };
  }

  async deleteScan(scanId: number, userId: number) {
    // Verify the scan belongs to the user
    const scan = await this.prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
    });

    if (!scan) {
      return null;
    }

    await this.prisma.scan.delete({
      where: {
        id: scanId,
      },
    });

    return scan;
  }

  async getUploadProgress(jobId: string) {
    return this.queueService.getUploadJobProgress(jobId);
  }
}
