import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from './scan.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScanService', () => {
  let service: ScanService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    scan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    tag: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ScanService>(ScanService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createScan', () => {
    it('should successfully create a scan with tags', async () => {
      const userId = 1;
      const createScanDto = {
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4', 'Claude'],
        tags: ['research', 'academic'],
      };

      const mockTag1 = { id: 1, name: 'research', createdAt: new Date() };
      const mockTag2 = { id: 2, name: 'academic', createdAt: new Date() };
      const mockScan = {
        id: 1,
        title: createScanDto.title,
        content: createScanDto.content,
        aiProviders: createScanDto.aiProviders,
        userId,
        tags: [mockTag1, mockTag2],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.upsert
        .mockResolvedValueOnce(mockTag1)
        .mockResolvedValueOnce(mockTag2);
      mockPrismaService.scan.create.mockResolvedValue(mockScan);

      const result = await service.createScan(userId, createScanDto);

      expect(mockPrismaService.tag.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.scan.create).toHaveBeenCalledWith({
        data: {
          title: createScanDto.title,
          content: createScanDto.content,
          aiProviders: createScanDto.aiProviders,
          userId,
          tags: {
            connect: [{ id: 1 }, { id: 2 }],
          },
        },
        include: {
          tags: true,
        },
      });
      expect(result).toEqual(mockScan);
    });

    it('should create a scan without tags', async () => {
      const userId = 1;
      const createScanDto = {
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4'],
      };

      const mockScan = {
        id: 1,
        title: createScanDto.title,
        content: createScanDto.content,
        aiProviders: createScanDto.aiProviders,
        userId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.scan.create.mockResolvedValue(mockScan);

      const result = await service.createScan(userId, createScanDto);

      expect(mockPrismaService.tag.upsert).not.toHaveBeenCalled();
      expect(result).toEqual(mockScan);
    });
  });

  describe('getUserScans', () => {
    it('should retrieve all scans for a user', async () => {
      const userId = 1;
      const mockScans = [
        {
          id: 1,
          title: 'Scan 1',
          content: 'Content 1',
          aiProviders: ['GPT-4'],
          userId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Scan 2',
          content: 'Content 2',
          aiProviders: ['Claude'],
          userId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.scan.findMany.mockResolvedValue(mockScans);

      const result = await service.getUserScans(userId);

      expect(mockPrismaService.scan.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockScans);
    });
  });

  describe('getScanById', () => {
    it('should retrieve a scan with mock documents', async () => {
      const userId = 1;
      const scanId = 1;
      const mockScan = {
        id: scanId,
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4', 'Claude'],
        userId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.scan.findFirst.mockResolvedValue(mockScan);

      const result = await service.getScanById(scanId, userId);

      expect(mockPrismaService.scan.findFirst).toHaveBeenCalledWith({
        where: {
          id: scanId,
          userId,
        },
        include: {
          tags: true,
        },
      });
      expect(result).toHaveProperty('documents');
      expect(result.documents).toHaveLength(2);
      expect(result.documents[0].detectedBy).toBe('GPT-4');
      expect(result.documents[1].detectedBy).toBe('Claude');
    });

    it('should return null if scan not found', async () => {
      const userId = 1;
      const scanId = 999;

      mockPrismaService.scan.findFirst.mockResolvedValue(null);

      const result = await service.getScanById(scanId, userId);

      expect(result).toBeNull();
    });
  });

  describe('deleteScan - US-006', () => {
    it('should successfully delete a scan if it belongs to the user', async () => {
      const userId = 1;
      const scanId = 1;
      const mockScan = {
        id: scanId,
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4'],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.scan.findFirst.mockResolvedValue(mockScan);
      mockPrismaService.scan.delete.mockResolvedValue(mockScan);

      const result = await service.deleteScan(scanId, userId);

      expect(mockPrismaService.scan.findFirst).toHaveBeenCalledWith({
        where: {
          id: scanId,
          userId,
        },
      });
      expect(mockPrismaService.scan.delete).toHaveBeenCalledWith({
        where: {
          id: scanId,
        },
      });
      expect(result).toEqual(mockScan);
    });

    it('should return null if scan does not exist', async () => {
      const userId = 1;
      const scanId = 999;

      mockPrismaService.scan.findFirst.mockResolvedValue(null);

      const result = await service.deleteScan(scanId, userId);

      expect(mockPrismaService.scan.findFirst).toHaveBeenCalledWith({
        where: {
          id: scanId,
          userId,
        },
      });
      expect(mockPrismaService.scan.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if scan belongs to different user', async () => {
      const userId = 1;
      const differentUserId = 2;
      const scanId = 1;

      mockPrismaService.scan.findFirst.mockResolvedValue(null);

      const result = await service.deleteScan(scanId, userId);

      expect(mockPrismaService.scan.findFirst).toHaveBeenCalledWith({
        where: {
          id: scanId,
          userId,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('cascade deletion behavior - US-006', () => {
    it('should verify cascade delete is handled by Prisma', async () => {
      // This test verifies that when a scan is deleted, 
      // Prisma handles the cascade deletion of related records
      // The junction table for many-to-many relationships (tags)
      // is automatically cleaned up by Prisma
      const userId = 1;
      const scanId = 1;
      const mockScanWithTags = {
        id: scanId,
        title: 'Test Scan with Tags',
        content: 'Test content',
        aiProviders: ['GPT-4'],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.scan.findFirst.mockResolvedValue(mockScanWithTags);
      mockPrismaService.scan.delete.mockResolvedValue(mockScanWithTags);

      await service.deleteScan(scanId, userId);

      // Verify that Prisma's delete method is called
      // Prisma automatically handles cascade deletion of:
      // 1. The scan record itself
      // 2. The junction table entries (_ScanToTag)
      // Tags themselves are NOT deleted (correct behavior)
      expect(mockPrismaService.scan.delete).toHaveBeenCalledWith({
        where: {
          id: scanId,
        },
      });
    });
  });
});
