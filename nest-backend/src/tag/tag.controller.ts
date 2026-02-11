import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ConflictException,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTag(@Body() createTagDto: CreateTagDto) {
    // Check if tag already exists
    const existingTag = await this.tagService.findTagByName(createTagDto.name);
    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }
    return this.tagService.createTag(createTagDto);
  }
}
