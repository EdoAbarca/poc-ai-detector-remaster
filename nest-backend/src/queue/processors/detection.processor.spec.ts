import { Test, TestingModule } from '@nestjs/testing';
import { DetectionProcessor } from './detection.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { DetectService } from '../../detect/detect.service';
import { Job } from 'bullmq';

describe('DetectionProcessor', () => {
  let processor: DetectionProcessor;
  let prismaService: PrismaService;
  let detectService: DetectService;

  const mockPrismaService = {
    document: {
      findUnique: jest.fn(),
    },
    result: {
      create: jest.fn(),
    },
  };

  const mockDetectService = {
    detectWithFastDetectGPT: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetectionProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DetectService,
          useValue: mockDetectService,
        },
      ],
    }).compile();

    processor = module.get<DetectionProcessor>(DetectionProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
    detectService = module.get<DetectService>(DetectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process document chunks and aggregate results as AI', async () => {
      const mockJob = {
        id: 'test-job-1',
        data: {
          fileId: '1',
          content: 'Full document content',
          userId: '1',
        },
        updateProgress: jest.fn(),
      } as unknown as Job<any>;

      const mockDocument = {
        id: 1,
        filename: 'test-document.txt',
        textChunks: [
          'This is the first chunk of AI-generated text.',
          'This is the second chunk of AI-generated text.',
          'This is the third chunk of AI-generated text.',
        ],
        scan: { id: 1, userId: 1 },
      };

      const mockDetectionResults = [
        { ai_score: 85.0, ai_result: 'AI' as const, criterion: 1.2 },
        { ai_score: 90.0, ai_result: 'AI' as const, criterion: 1.5 },
        { ai_score: 80.0, ai_result: 'AI' as const, criterion: 1.0 },
      ];

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);

      mockDetectService.detectWithFastDetectGPT
        .mockResolvedValueOnce(mockDetectionResults[0])
        .mockResolvedValueOnce(mockDetectionResults[1])
        .mockResolvedValueOnce(mockDetectionResults[2]);

      mockPrismaService.result.create
        .mockResolvedValueOnce({
          id: 1,
          documentId: 1,
          chunkIndex: 0,
          chunkText: mockDocument.textChunks[0],
          aiScore: mockDetectionResults[0].ai_score,
          aiResult: mockDetectionResults[0].ai_result,
          criterion: mockDetectionResults[0].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 2,
          documentId: 1,
          chunkIndex: 1,
          chunkText: mockDocument.textChunks[1],
          aiScore: mockDetectionResults[1].ai_score,
          aiResult: mockDetectionResults[1].ai_result,
          criterion: mockDetectionResults[1].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 3,
          documentId: 1,
          chunkIndex: 2,
          chunkText: mockDocument.textChunks[2],
          aiScore: mockDetectionResults[2].ai_score,
          aiResult: mockDetectionResults[2].ai_result,
          criterion: mockDetectionResults[2].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        });

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.documentId).toBe(1);
      expect(result.result.overallResult).toBe('AI');
      expect(result.result.totalChunks).toBe(3);
      expect(result.result.aiChunks).toBe(3);
      expect(result.result.humanChunks).toBe(0);
      expect(result.result.avgAiScore).toBeCloseTo(85.0, 1);

      expect(mockDetectService.detectWithFastDetectGPT).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.result.create).toHaveBeenCalledTimes(3);
      expect(mockJob.updateProgress).toHaveBeenCalled();
    });

    it('should process document chunks and aggregate results as Human', async () => {
      const mockJob = {
        id: 'test-job-2',
        data: {
          fileId: '2',
          content: 'Full document content',
          userId: '1',
        },
        updateProgress: jest.fn(),
      } as unknown as Job<any>;

      const mockDocument = {
        id: 2,
        filename: 'test-document.txt',
        textChunks: [
          'This is the first chunk of human-written text.',
          'This is the second chunk of human-written text.',
          'This is the third chunk of AI-generated text.',
        ],
        scan: { id: 1, userId: 1 },
      };

      const mockDetectionResults = [
        { ai_score: 20.0, ai_result: 'Human' as const, criterion: -0.5 },
        { ai_score: 15.0, ai_result: 'Human' as const, criterion: -0.8 },
        { ai_score: 85.0, ai_result: 'AI' as const, criterion: 1.2 },
      ];

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);

      mockDetectService.detectWithFastDetectGPT
        .mockResolvedValueOnce(mockDetectionResults[0])
        .mockResolvedValueOnce(mockDetectionResults[1])
        .mockResolvedValueOnce(mockDetectionResults[2]);

      mockPrismaService.result.create
        .mockResolvedValueOnce({
          id: 1,
          documentId: 2,
          chunkIndex: 0,
          chunkText: mockDocument.textChunks[0],
          aiScore: mockDetectionResults[0].ai_score,
          aiResult: mockDetectionResults[0].ai_result,
          criterion: mockDetectionResults[0].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 2,
          documentId: 2,
          chunkIndex: 1,
          chunkText: mockDocument.textChunks[1],
          aiScore: mockDetectionResults[1].ai_score,
          aiResult: mockDetectionResults[1].ai_result,
          criterion: mockDetectionResults[1].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 3,
          documentId: 2,
          chunkIndex: 2,
          chunkText: mockDocument.textChunks[2],
          aiScore: mockDetectionResults[2].ai_score,
          aiResult: mockDetectionResults[2].ai_result,
          criterion: mockDetectionResults[2].criterion,
          model: 'fast-detect-gpt',
          createdAt: new Date(),
        });

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.result.overallResult).toBe('Human');
      expect(result.result.aiChunks).toBe(1);
      expect(result.result.humanChunks).toBe(2);
    });

    it('should handle document not found', async () => {
      const mockJob = {
        id: 'test-job-3',
        data: {
          fileId: '999',
          content: 'Content',
          userId: '1',
        },
        updateProgress: jest.fn(),
      } as unknown as Job<any>;

      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(processor.process(mockJob)).rejects.toThrow('Document not found: 999');
    });

    it('should handle document with no chunks', async () => {
      const mockJob = {
        id: 'test-job-4',
        data: {
          fileId: '3',
          content: 'Content',
          userId: '1',
        },
        updateProgress: jest.fn(),
      } as unknown as Job<any>;

      const mockDocument = {
        id: 3,
        filename: 'empty-document.txt',
        textChunks: [],
        scan: { id: 1, userId: 1 },
      };

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);

      const result = await processor.process(mockJob);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No text chunks to analyze');
      expect(mockDetectService.detectWithFastDetectGPT).not.toHaveBeenCalled();
    });

    it('should update progress throughout processing', async () => {
      const mockJob = {
        id: 'test-job-5',
        data: {
          fileId: '4',
          content: 'Content',
          userId: '1',
        },
        updateProgress: jest.fn(),
      } as unknown as Job<any>;

      const mockDocument = {
        id: 4,
        filename: 'test.txt',
        textChunks: ['Chunk 1', 'Chunk 2'],
        scan: { id: 1, userId: 1 },
      };

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      mockDetectService.detectWithFastDetectGPT.mockResolvedValue({
        ai_score: 50.0,
        ai_result: 'Human',
        criterion: 0.0,
      });
      mockPrismaService.result.create.mockResolvedValue({
        id: 1,
        documentId: 4,
        chunkIndex: 0,
        chunkText: 'Chunk',
        ai_score: 50.0,
        ai_result: 'Human',
        criterion: 0.0,
        model: 'fast-detect-gpt',
        createdAt: new Date(),
      });

      await processor.process(mockJob);

      expect(mockJob.updateProgress).toHaveBeenCalledWith(0);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(expect.any(Number));
      expect(mockJob.updateProgress).toHaveBeenCalledWith(95);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    });
  });
});
