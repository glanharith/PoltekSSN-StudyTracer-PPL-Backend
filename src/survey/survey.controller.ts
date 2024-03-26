import { IsAdmin, IsAlumni } from 'src/common/decorator';
import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO, EditSurveyDTO } from './DTO/SurveyDTO';
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

  @Get('/get/:surveyId')
  @IsAlumni()
  async getSurveyForAlumni(@Param('surveyId') surveyId: string) {
    return this.surveyService.getSurveyById(surveyId);
  }

  @Patch('/:id')
  @IsAdmin()
  async editSurvey(
    @Param('id') id: string,
    @Body() editSurveyDTO: EditSurveyDTO,
  ) {
    await this.surveyService.editSurvey(id, editSurveyDTO);

    return response('Survey successfully updated');
  }

  @Delete('/:id')
  @IsAdmin()
  async deleteSurvey(@Param('id') id: string) {
    return this.surveyService.deleteSurvey(id);
  }

  @Get('/:id')
  @IsAdmin()
  async getSurvey(@Param('id') id: string) {
    return this.surveyService.getSurvey(id);
  }
}
