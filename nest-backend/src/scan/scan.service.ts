import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScanDto } from './dto/create-scan.dto';

@Injectable()
export class ScanService {
  constructor(private prisma: PrismaService) {}

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

  async getUserScans(userId: number) {
    const scans = await this.prisma.scan.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return scans;
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
}
