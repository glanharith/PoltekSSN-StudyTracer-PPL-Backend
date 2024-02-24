import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { UpdateHeadOfStudyProgramDto } from './dto/update-head-of-study-program.dto';

@Controller('head-of-study-program')
export class HeadOfStudyProgramController {
  constructor(private readonly headOfStudyProgramService: HeadOfStudyProgramService) {}

  @Post()
  create(@Body() createHeadOfStudyProgramDto: CreateHeadOfStudyProgramDto) {
    return this.headOfStudyProgramService.create(createHeadOfStudyProgramDto);
  }

  @Get()
  findAll() {
    return this.headOfStudyProgramService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.headOfStudyProgramService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHeadOfStudyProgramDto: UpdateHeadOfStudyProgramDto) {
    return this.headOfStudyProgramService.update(+id, updateHeadOfStudyProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.headOfStudyProgramService.remove(+id);
  }
}
