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
} from '@nestjs/common';
import { ScanService } from './scan.service';
import { CreateScanDto } from './dto/create-scan.dto';

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
