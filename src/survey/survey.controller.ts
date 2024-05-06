import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO, EditSurveyDTO } from './DTO/SurveyDTO';
import {
  IsAdmin,
  IsHead,
  IsPublic,
  IsAlumni,
  ReqUser,
} from 'src/common/decorator';
import { response } from 'src/common/util/response';
import { FillSurveyDTO } from './DTO/FIllSurveyDTO';
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @IsAdmin()
  async createSurvey(@Body() createSurveyDTO: CreateSurveyDTO) {
    await this.surveyService.createSurvey(createSurveyDTO);

    return response('Survey successfully created');
  }

  @Post('/fill-survey')
  @IsAlumni()
  async fillSurvey(@ReqUser() request, @Body() fillSurveyDTO: FillSurveyDTO) {
    await this.surveyService.fillSurvey(fillSurveyDTO, request.email);
    return response('Survey successfully filled');
  }

  @Get('/get/:surveyId')
  @IsAlumni()
  async getSurveyForAlumni(
    @ReqUser() request,
    @Param('surveyId') surveyId: string,
  ) {
    return this.surveyService.getSurveyForFill(surveyId, request.email);
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

  @Get('/all')
  @IsAdmin()
  @IsHead()
  async getAllSurveys() {
    const allSurveys = await this.surveyService.getAllSurveys();
    return response('Successfully got all surveys', {
      data: allSurveys,
    });
  }

  @Get('/:id')
  @IsAdmin()
  async getSurvey(@Param('id') id: string) {
    return this.surveyService.getSurvey(id);
  }

  @Get('/:id/responses')
  @IsAdmin()
  async downloadSurveyResponses(@Param('id') id: string) {
    return this.surveyService.downloadSurveyResponses(id);
  }

  @Get()
  @IsPublic()
  async getAvailableSurveyByYear(
    @Query('admissionYear') admissionYear: string,
    @Query('graduateYear') graduateYear: string,
  ) {
    const surveys = await this.surveyService.getAvailableSurveyByYear(
      admissionYear,
      graduateYear,
    );

    return response(
      `Successfully got surveys for admission year ${admissionYear} and graduate year ${graduateYear}`,
      {
        data: surveys,
      },
    );
  }

  @Get('/:id/response-preview/questions')
  @IsAdmin()
  @IsHead()
  async getSurveyResponseByQuestions(@Param('id') id: string) {
    return this.surveyService.getSurveyResponseByQuestions(id);
  }

  @Get('/:id/response-preview/alumni')
  @IsAdmin()
  @IsHead()
  async getSurveyResponseByAlumni(@Param('id') id: string, @ReqUser() request) {
    const responses = await this.surveyService.getSurveyResponseByAlumni(id, request.email);
    return response(`Successfully got responses for survey ${id}`, {
      data: responses,
    });
  }
}
