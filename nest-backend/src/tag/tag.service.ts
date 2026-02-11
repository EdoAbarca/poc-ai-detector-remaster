import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async getUserTags(userId: number) {
    // Get all tags that are associated with scans belonging to the user
    const scans = await this.prisma.scan.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
      },
    });

    // Extract unique tags from all scans
    const tagsMap = new Map();
    scans.forEach(scan => {
      scan.tags.forEach(tag => {
        if (!tagsMap.has(tag.id)) {
          tagsMap.set(tag.id, {
            ...tag,
            scanCount: 0,
          });
        }
        tagsMap.get(tag.id).scanCount += 1;
      });
    });

    // Convert map to array and sort by name
    return Array.from(tagsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  async getAllTags() {
    // Get all tags with scan count
    const tags = await this.prisma.tag.findMany({
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

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      scanCount: tag._count.scans,
    }));
  }
}
