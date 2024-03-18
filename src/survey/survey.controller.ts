import { Body, Controller, Post } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
import { IsPublic } from 'src/common/decorator';
import { response } from 'src/common/util/response';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @IsPublic()
  async createSurvey(@Body() createSurveyDTO: CreateSurveyDTO) {
    await this.surveyService.createSurvey(createSurveyDTO);

    return response('Survey successfully created');
  }
}
