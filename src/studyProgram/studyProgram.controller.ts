import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudyProgramService } from './studyProgram.service';
import { StudyProgramDTO } from './DTO';
import { response } from 'src/common/util/response';
import { IsAdmin, IsPublic } from 'src/common/decorator';

@Controller('prodi')
export class StudyProgramController {
  constructor(private readonly studyProgramService: StudyProgramService) {}

  @IsAdmin()
  @Post()
  async createStudyProgram(@Body() programDTO: StudyProgramDTO) {
    await this.studyProgramService.create(programDTO);
    return response('Successfully created a new study program');
  }

  @IsAdmin()
  @Patch('/:id')
  async updateStudyProgram(
    @Param('id') id: string,
    @Body() programDTO: StudyProgramDTO,
  ) {
    await this.studyProgramService.update(id, programDTO);
    return response('Successfully updated a study program');
  }

  @IsPublic()
  @IsAdmin()
  @Get('paginated')
  async viewAllStudyProgram(@Query('page') page: number) {
    return response('Successfully got all study programs', {
      data: await this.studyProgramService.viewAll(page),
    });
  }

  @IsPublic()
  @Get()
  async getAllStudyPrograms() {
    return response('Successfully got all study programs', {
      data: await this.studyProgramService.findAll(),
    });
  }

  @IsAdmin()
  @Delete('/:id')
  async deleteStudyProgram(@Param('id') id: string) {
    await this.studyProgramService.delete(id);
    return response('Successfully deleted a study program');
  }

  @IsAdmin()
  @Delete()
  async deleteMultipleStudyPrograms(@Body('ids') ids: string[]) {
    await this.studyProgramService.deleteMultiple(ids);
    return response('Successfully deleted study programs');
  }
}
