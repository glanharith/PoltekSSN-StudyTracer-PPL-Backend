import { IsAdmin, IsAlumni } from 'src/common/decorator';
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
import { IsAdmin, IsHead, IsPublic } from 'src/common/decorator';
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
  async fillSurvey(@Body() fillSurveyDTO: FillSurveyDTO) {
    for (const key in fillSurveyDTO) {
      if (fillSurveyDTO.hasOwnProperty(key)) {
        const value = fillSurveyDTO[key];
        console.log('Key:', key);
        console.log('Value:', value);
      }
    }
    console.log('DDDDD');
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

  @Get()
  @IsPublic()
  async getAvailableSurveyByYear(
    @Query('admissionYear') admissionYear: string,
    @Query('graduateYear') graduateYear: string,
  ) {
    const surveys = await this.surveyService.getAvailableSurveyByYear(admissionYear, graduateYear);

    return response(`Successfully got surveys for admission year ${admissionYear} and graduate year ${graduateYear}`, {
      data: surveys,
    })
  }

  @Get('/all')
  @IsAdmin()
  @IsHead()
  async getAllSurveys() {
    const allSurveys = await this.surveyService.getAllSurveys();
    return response('Successfully got all surveys', {
      data: allSurveys,
    })
  }
}
