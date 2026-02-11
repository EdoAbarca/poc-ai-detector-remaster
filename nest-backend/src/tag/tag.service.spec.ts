import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TagService', () => {
  let service: TagService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    scan: {
      findMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getUserTags', () => {
    it('should return unique tags with scan counts for a user', async () => {
      const userId = 1;
      const mockScans = [
        {
          id: 1,
          title: 'Scan 1',
          userId,
          tags: [
            { id: 1, name: 'Finance', createdAt: new Date('2023-10-24') },
            { id: 2, name: 'Urgent', createdAt: new Date('2023-11-01') },
          ],
        },
        {
          id: 2,
          title: 'Scan 2',
          userId,
          tags: [
            { id: 1, name: 'Finance', createdAt: new Date('2023-10-24') },
            { id: 3, name: 'Marketing', createdAt: new Date('2023-10-10') },
          ],
        },
      ];

      mockPrismaService.scan.findMany.mockResolvedValue(mockScans);

      const result = await service.getUserTags(userId);

      expect(mockPrismaService.scan.findMany).toHaveBeenCalledWith({
        where: {
          userId,
        },
        include: {
          tags: true,
        },
      });

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Finance');
      expect(result[0].scanCount).toBe(2);
      expect(result[1].name).toBe('Marketing');
      expect(result[1].scanCount).toBe(1);
      expect(result[2].name).toBe('Urgent');
      expect(result[2].scanCount).toBe(1);
    });

    it('should return empty array when user has no scans', async () => {
      const userId = 1;

      mockPrismaService.scan.findMany.mockResolvedValue([]);

      const result = await service.getUserTags(userId);

      expect(result).toEqual([]);
    });

    it('should return empty array when scans have no tags', async () => {
      const userId = 1;
      const mockScans = [
        {
          id: 1,
          title: 'Scan 1',
          userId,
          tags: [],
        },
      ];

      mockPrismaService.scan.findMany.mockResolvedValue(mockScans);

      const result = await service.getUserTags(userId);

      expect(result).toEqual([]);
    });

    it('should sort tags alphabetically by name', async () => {
      const userId = 1;
      const mockScans = [
        {
          id: 1,
          title: 'Scan 1',
          userId,
          tags: [
            { id: 1, name: 'Zebra', createdAt: new Date('2023-10-24') },
            { id: 2, name: 'Apple', createdAt: new Date('2023-11-01') },
            { id: 3, name: 'Mango', createdAt: new Date('2023-10-10') },
          ],
        },
      ];

      mockPrismaService.scan.findMany.mockResolvedValue(mockScans);

      const result = await service.getUserTags(userId);

      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Mango');
      expect(result[2].name).toBe('Zebra');
    });
  });

  describe('getAllTags', () => {
    it('should return all tags with scan counts', async () => {
      const mockTags = [
        {
          id: 1,
          name: 'Finance',
          createdAt: new Date('2023-10-24'),
          _count: {
            scans: 14,
          },
        },
        {
          id: 2,
          name: 'Urgent Review',
          createdAt: new Date('2023-11-01'),
          _count: {
            scans: 3,
          },
        },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.getAllTags();

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              scans: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Finance',
        createdAt: mockTags[0].createdAt,
        scanCount: 14,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Urgent Review',
        createdAt: mockTags[1].createdAt,
        scanCount: 3,
      });
    });

    it('should return empty array when no tags exist', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      const result = await service.getAllTags();

      expect(result).toEqual([]);
    });

    it('should sort tags alphabetically', async () => {
      const mockTags = [
        {
          id: 1,
          name: 'Zebra',
          createdAt: new Date('2023-10-24'),
          _count: { scans: 5 },
        },
        {
          id: 2,
          name: 'Apple',
          createdAt: new Date('2023-11-01'),
          _count: { scans: 10 },
        },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.getAllTags();

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            name: 'asc',
          },
        })
      );
    });
  });
});
