import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('api/v1/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserTags(@Param('userId', ParseIntPipe) userId: number) {
    return this.tagService.getUserTags(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTags() {
    return this.tagService.getAllTags();
  }
}
