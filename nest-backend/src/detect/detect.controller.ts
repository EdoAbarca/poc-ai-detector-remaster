import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { DetectService } from './detect.service';
import { CreateDetectDto } from './dto/create-detect.dto';

@Controller('api/v1/detect')
export class DetectController {
  constructor(private readonly detectService: DetectService) {}

  @Post('fast-detect-gpt')
  @HttpCode(HttpStatus.OK)
  async detectWithFastDetectGPT(
    @Body(new ValidationPipe({ whitelist: true })) createDetectDto: CreateDetectDto,
  ) {
    return this.detectService.detectWithFastDetectGPT(createDetectDto);
  }
}
