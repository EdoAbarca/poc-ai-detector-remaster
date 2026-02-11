import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

describe('TagService', () => {
  let service: TagService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    scan: {
      findMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
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

  describe('findTagByName - US-008', () => {
    it('should find a tag by name (case-insensitive)', async () => {
      const tagName = 'Finance';
      const mockTag = {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24'),
      };

      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      const result = await service.findTagByName(tagName);

      expect(mockPrismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: tagName,
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag is not found', async () => {
      const tagName = 'NonExistent';

      mockPrismaService.tag.findFirst.mockResolvedValue(null);

      const result = await service.findTagByName(tagName);

      expect(result).toBeNull();
    });
  });

  describe('createTag - US-008', () => {
    it('should create a new tag', async () => {
      const createTagDto: CreateTagDto = {
        name: 'NewTag',
      };

      const createdTag = {
        id: 1,
        name: 'NewTag',
        createdAt: new Date('2024-02-11'),
      };

      mockPrismaService.tag.create.mockResolvedValue(createdTag);

      const result = await service.createTag(createTagDto);

      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: {
          name: createTagDto.name,
        },
      });
      expect(result).toEqual(createdTag);
    });

    it('should create a tag with the exact name provided', async () => {
      const createTagDto: CreateTagDto = {
        name: 'My Custom Tag',
      };

      const createdTag = {
        id: 2,
        name: 'My Custom Tag',
        createdAt: new Date('2024-02-11'),
      };

      mockPrismaService.tag.create.mockResolvedValue(createdTag);

      const result = await service.createTag(createTagDto);

      expect(result.name).toBe('My Custom Tag');
    });
  });

  describe('deleteTag - US-009', () => {
    it('should delete an existing tag', async () => {
      const tagId = 1;
      const existingTag = {
        id: tagId,
        name: 'ToDelete',
        createdAt: new Date('2024-02-11'),
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(existingTag);
      mockPrismaService.tag.delete.mockResolvedValue(existingTag);

      const result = await service.deleteTag(tagId);

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(result).toEqual(existingTag);
    });

    it('should return null when tag does not exist', async () => {
      const tagId = 999;

      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      const result = await service.deleteTag(tagId);

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(mockPrismaService.tag.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle deletion of tag with many-to-many relationships', async () => {
      const tagId = 1;
      const existingTag = {
        id: tagId,
        name: 'TagWithRelations',
        createdAt: new Date('2024-02-11'),
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(existingTag);
      mockPrismaService.tag.delete.mockResolvedValue(existingTag);

      const result = await service.deleteTag(tagId);

      expect(result).toEqual(existingTag);
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId },
      });
    });
  });
});
