import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

describe('ScanController', () => {
  let controller: ScanController;
  let service: ScanService;

  const mockScanService = {
    createScan: jest.fn(),
    getUserScans: jest.fn(),
    getScanById: jest.fn(),
    deleteScan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        {
          provide: ScanService,
          useValue: mockScanService,
        },
      ],
    }).compile();

    controller = module.get<ScanController>(ScanController);
    service = module.get<ScanService>(ScanService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createScan', () => {
    it('should create a scan', async () => {
      const createScanDto = {
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4'],
        tags: ['research'],
      };

      const mockScan = {
        id: 1,
        ...createScanDto,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockScanService.createScan.mockResolvedValue(mockScan);

      const result = await controller.createScan(createScanDto);

      expect(mockScanService.createScan).toHaveBeenCalledWith(1, createScanDto);
      expect(result).toEqual(mockScan);
    });
  });

  describe('getUserScans', () => {
    it('should retrieve user scans', async () => {
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
      ];

      mockScanService.getUserScans.mockResolvedValue(mockScans);

      const result = await controller.getUserScans(userId);

      expect(mockScanService.getUserScans).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockScans);
    });
  });

  describe('getScanById', () => {
    it('should retrieve a scan by id', async () => {
      const scanId = 1;
      const mockScan = {
        id: scanId,
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4'],
        userId: 1,
        tags: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockScanService.getScanById.mockResolvedValue(mockScan);

      const result = await controller.getScanById(scanId);

      expect(mockScanService.getScanById).toHaveBeenCalledWith(scanId, 1);
      expect(result).toEqual(mockScan);
    });

    it('should throw NotFoundException if scan not found', async () => {
      const scanId = 999;

      mockScanService.getScanById.mockResolvedValue(null);

      await expect(controller.getScanById(scanId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteScan - US-006', () => {
    it('should successfully delete a scan', async () => {
      const scanId = 1;
      const userId = 1;
      const mockDeletedScan = {
        id: scanId,
        title: 'Test Scan',
        content: 'Test content',
        aiProviders: ['GPT-4'],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockScanService.deleteScan.mockResolvedValue(mockDeletedScan);

      const result = await controller.deleteScan(scanId);

      expect(mockScanService.deleteScan).toHaveBeenCalledWith(scanId, userId);
      expect(result).toEqual({
        message: 'Scan deleted successfully',
        scan: mockDeletedScan,
      });
    });

    it('should throw NotFoundException if scan not found', async () => {
      const scanId = 999;

      mockScanService.deleteScan.mockResolvedValue(null);

      await expect(controller.deleteScan(scanId)).rejects.toThrow(
        new NotFoundException('Scan not found or you do not have permission to delete it'),
      );
    });

    it('should throw NotFoundException if user does not own the scan', async () => {
      const scanId = 1;

      mockScanService.deleteScan.mockResolvedValue(null);

      await expect(controller.deleteScan(scanId)).rejects.toThrow(NotFoundException);
    });
  });
});
