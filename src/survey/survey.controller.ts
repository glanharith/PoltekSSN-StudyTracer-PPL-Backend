import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO, EditSurveyDTO } from './DTO/CreateSurveyDTO';
// import { IsAdmin } from 'src/common/decorator';
import { IsPublic } from 'src/common/decorator';
import { response } from 'src/common/util/response';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  // @IsAdmin()
  @IsPublic()
  async createSurvey(@Body() createSurveyDTO: CreateSurveyDTO) {
    await this.surveyService.createSurvey(createSurveyDTO);

    return response('Survey successfully created');
  }

  @Patch('/:id')
  // @IsAdmin()
  @IsPublic()
  async editSurvey(
    @Param('id') id: string,
    @Body() editSurveyDTO: EditSurveyDTO,
  ) {
    await this.surveyService.editSurvey(id, editSurveyDTO);

    return response('Survey successfully updated');
  }
}
