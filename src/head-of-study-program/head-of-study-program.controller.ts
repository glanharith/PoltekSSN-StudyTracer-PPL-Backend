import { Controller, Get, Post, Body } from '@nestjs/common';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { IsAdmin } from 'src/common/decorator';

@Controller('fg ')
export class HeadOfStudyProgramController {
  constructor(
    private readonly headOfStudyProgramService: HeadOfStudyProgramService,
  ) {}

  @Post()
  @IsAdmin()
  async create(
    @Body() createHeadOfStudyProgramDto: CreateHeadOfStudyProgramDto,
  ) {
    return this.headOfStudyProgramService.create(createHeadOfStudyProgramDto);
  }

  @Get()
  @IsAdmin()
  async findAll() {
    return this.headOfStudyProgramService.findAll();
  }
}
