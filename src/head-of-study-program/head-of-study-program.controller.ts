import { Controller, Get, Post, Body, Delete, Param, Patch, } from '@nestjs/common';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { IsAdmin } from 'src/common/decorator';
import { response } from 'src/common/util/response';

@Controller('kaprodi')
export class HeadOfStudyProgramController {
  constructor(
    private readonly headOfStudyProgramService: HeadOfStudyProgramService,
  ) {}

  @Post()
  @IsAdmin()
  async create(
    @Body() createHeadOfStudyProgramDto: CreateHeadOfStudyProgramDto,
  ) {
    this.headOfStudyProgramService.create(createHeadOfStudyProgramDto);
    return response('Successfully created a new head of study program');
  }

  @Get()
  @IsAdmin()
  async findAll() {
    return this.headOfStudyProgramService.findAll();
  }

  @Delete('/:id')
  @IsAdmin()
  async delete(@Param('id') id: string) {
    return this.headOfStudyProgramService.delete(id);
  }

  // @Patch('/:id')
  // @IsAdmin()
  // async update(
  //   @Param('id') id: string,
  //   @Body() headOfStudyProgramDto: CreateHeadOfStudyProgramDto,
  // ) {
  //   return null;
  // }
}
