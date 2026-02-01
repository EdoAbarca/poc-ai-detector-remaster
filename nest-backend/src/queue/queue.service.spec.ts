import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('QueueService', () => {
  let service: QueueService;
  let mockUploadQueue: any;
  let mockDetectionQueue: any;

  beforeEach(async () => {
    mockUploadQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
      getJob: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
    };

    mockDetectionQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-456' }),
      getJob: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('upload-queue'),
          useValue: mockUploadQueue,
        },
        {
          provide: getQueueToken('detection-queue'),
          useValue: mockDetectionQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUploadJob', () => {
    it('should add an upload job to the queue', async () => {
      const jobData = {
        fileId: 'file-123',
        fileName: 'test.pdf',
        fileSize: 1024,
        userId: 'user-456',
      };

      const result = await service.addUploadJob(jobData);

      expect(mockUploadQueue.add).toHaveBeenCalledWith('upload-file', jobData, {
        removeOnComplete: true,
        removeOnFail: false,
      });
      expect(result).toEqual({
        jobId: 'job-123',
        queueName: 'upload-queue',
      });
    });
  });

  describe('addDetectionJob', () => {
    it('should add a detection job to the queue', async () => {
      const jobData = {
        fileId: 'file-123',
        content: 'Sample text content',
        userId: 'user-456',
      };

      const result = await service.addDetectionJob(jobData);

      expect(mockDetectionQueue.add).toHaveBeenCalledWith('detect-ai', jobData, {
        removeOnComplete: true,
        removeOnFail: false,
      });
      expect(result).toEqual({
        jobId: 'job-456',
        queueName: 'detection-queue',
      });
    });
  });

  describe('getUploadJobProgress', () => {
    it('should return job progress when job exists', async () => {
      const mockJob = {
        progress: 50,
        getState: jest.fn().mockResolvedValue('active'),
        returnvalue: 'Processing...',
      };
      mockUploadQueue.getJob.mockResolvedValue(mockJob);

      const result = await service.getUploadJobProgress('job-123');

      expect(result).toEqual({
        percentage: 50,
        status: 'active',
        message: 'Processing...',
      });
    });

    it('should return null when job does not exist', async () => {
      mockUploadQueue.getJob.mockResolvedValue(null);

      const result = await service.getUploadJobProgress('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUploadQueueStats', () => {
    it('should return queue statistics', async () => {
      mockUploadQueue.getWaitingCount.mockResolvedValue(5);
      mockUploadQueue.getActiveCount.mockResolvedValue(2);
      mockUploadQueue.getCompletedCount.mockResolvedValue(100);
      mockUploadQueue.getFailedCount.mockResolvedValue(3);

      const result = await service.getUploadQueueStats();

      expect(result).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
      });
    });
  });
});
