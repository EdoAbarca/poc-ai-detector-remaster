import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ScanService } from './scan.service';
import { CreateScanDto, CreateScanWithFilesDto } from './dto/create-scan.dto';

@Controller('api/v1/scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createScan(@Body(new ValidationPipe({ whitelist: true })) createScanDto: CreateScanDto) {
    // TODO: Get userId from JWT token once authentication is implemented
    // For now, we'll use a default userId
    const userId = 1;
    return this.scanService.createScan(userId, createScanDto);
  }

  @Post('with-files')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('documents', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only PDF, DOCX, and TXT files are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async createScanWithFiles(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one document is required');
    }

    // Parse JSON fields from form-data
    const createScanDto: CreateScanWithFilesDto = {
      title: body.title,
      aiProviders: body.aiProviders ? JSON.parse(body.aiProviders) : [],
      tags: body.tags ? JSON.parse(body.tags) : [],
    };

    // Validate DTO
    if (!createScanDto.title || createScanDto.title.trim() === '') {
      throw new BadRequestException('Title is required');
    }

    // TODO: Get userId from JWT token once authentication is implemented
    const userId = 1;
    return this.scanService.createScanWithFiles(userId, createScanDto, files);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserScans(@Param('userId', ParseIntPipe) userId: number) {
    return this.scanService.getUserScans(userId);
  }

  @Get(':scanId')
  @HttpCode(HttpStatus.OK)
  async getScanById(@Param('scanId', ParseIntPipe) scanId: number) {
    // TODO: Get userId from JWT token once authentication is implemented
    const userId = 1;
    const scan = await this.scanService.getScanById(scanId, userId);
    
    if (!scan) {
      throw new NotFoundException('Scan not found or you do not have permission to view it');
    }

    return scan;
  }

  @Get('upload-progress/:jobId')
  @HttpCode(HttpStatus.OK)
  async getUploadProgress(@Param('jobId') jobId: string) {
    const progress = await this.scanService.getUploadProgress(jobId);
    if (!progress) {
      throw new NotFoundException('Job not found');
    }
    return progress;
  }

  @Delete(':scanId')
  @HttpCode(HttpStatus.OK)
  async deleteScan(@Param('scanId', ParseIntPipe) scanId: number) {
    // TODO: Get userId from JWT token once authentication is implemented
    const userId = 1;
    const result = await this.scanService.deleteScan(scanId, userId);
    
    if (!result) {
      throw new NotFoundException('Scan not found or you do not have permission to delete it');
    }

    return { message: 'Scan deleted successfully', scan: result };
  }
}
