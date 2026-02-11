import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

describe('TagController', () => {
  let controller: TagController;
  let service: TagService;

  const mockTagService = {
    getUserTags: jest.fn(),
    getAllTags: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);

    jest.clearAllMocks();
  });

  describe('getUserTags - US-007', () => {
    it('should retrieve tags for a specific user', async () => {
      const userId = 1;
      const mockTags = [
        {
          id: 1,
          name: 'Finance',
          createdAt: new Date('2023-10-24'),
          scanCount: 14,
        },
        {
          id: 2,
          name: 'Marketing',
          createdAt: new Date('2023-10-10'),
          scanCount: 42,
        },
      ];

      mockTagService.getUserTags.mockResolvedValue(mockTags);

      const result = await controller.getUserTags(userId);

      expect(mockTagService.getUserTags).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTags);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no tags', async () => {
      const userId = 1;

      mockTagService.getUserTags.mockResolvedValue([]);

      const result = await controller.getUserTags(userId);

      expect(mockTagService.getUserTags).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getAllTags', () => {
    it('should retrieve all tags', async () => {
      const mockTags = [
        {
          id: 1,
          name: 'Finance',
          createdAt: new Date('2023-10-24'),
          scanCount: 14,
        },
        {
          id: 2,
          name: 'Marketing',
          createdAt: new Date('2023-10-10'),
          scanCount: 42,
        },
      ];

      mockTagService.getAllTags.mockResolvedValue(mockTags);

      const result = await controller.getAllTags();

      expect(mockTagService.getAllTags).toHaveBeenCalled();
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags exist', async () => {
      mockTagService.getAllTags.mockResolvedValue([]);

      const result = await controller.getAllTags();

      expect(result).toEqual([]);
    });
  });
});
