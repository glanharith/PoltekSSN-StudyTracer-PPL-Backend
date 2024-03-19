import { Body, Controller, Post, Delete ,Param } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
import { IsAdmin } from 'src/common/decorator';
import { response } from 'src/common/util/response';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @IsAdmin()
  async createSurvey(@Body() createSurveyDTO: CreateSurveyDTO) {
    await this.surveyService.createSurvey(createSurveyDTO);

    return response('Survey successfully created');
  }

  @Delete()
  @IsAdmin()
  async delete(@Param('id') id: string) {
    return this.surveyService.delete(id);
  }
}
