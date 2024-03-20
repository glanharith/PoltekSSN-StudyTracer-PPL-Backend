import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Form, Question, Option } from '@prisma/client';

jest.mock('./survey.service');

describe('SurveyController', () => {
  let surveyController: SurveyController;
  let surveyServiceMock: jest.Mocked<SurveyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyController],
      providers: [SurveyService],
    }).compile();

    surveyController = module.get<SurveyController>(SurveyController);
    surveyServiceMock = module.get<jest.Mocked<SurveyService>>(SurveyService);
  });

  describe('POST /survey', () => {
    const createSurveyDTO: CreateSurveyDTO = {
      title: 'title',
      type: 'CURRICULUM',
      description: 'description',
      startTime: new Date(2024, 0, 1),
      endTime: new Date(2024, 1, 1),
      questions: [
        {
          type: 'TEXT',
          question: 'Question',
          order: 1,
        },
      ],
    };

    it('should return success message', async () => {
      surveyServiceMock.createSurvey.mockResolvedValue();

      const result = await surveyController.createSurvey(createSurveyDTO);

      expect(result).toEqual({ message: 'Survey successfully created' });
    });
  });

  describe('DELETE /survey/:id', () => {
    const id = 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef';
    const nonExistentId = 'notExist';

    it('should successfully delete a survey', async () => {
      surveyServiceMock.deleteSurvey.mockResolvedValue(id);
      const result = await surveyController.deleteSurvey(id);

      expect(result).toEqual(id);

      expect(surveyServiceMock.deleteSurvey).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException for a non-existing survey', async () => {
      surveyServiceMock.deleteSurvey.mockRejectedValue(new NotFoundException('Survey not found'));
      
      await expect(surveyController.deleteSurvey(id)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle errors during deletion', async () => {
      surveyServiceMock.deleteSurvey.mockRejectedValue(
        new InternalServerErrorException('Error while deleting survey')
      );

      await expect(surveyController.deleteSurvey(id)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('GET /survey/:id', () => {
    const option = [{
      id: 'da20eb7a-8667-4a82-a18d-47aca6cf84ef',
      label: '21',
      questionId: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
      order: 0
    }];
    
    const question = [{
      id: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
      type: 'RADIO',
      question: 'What is 9 + 10',
      order: 0,
      formId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
      rangeFrom: null,
      rangeTo: null,
      options: option
    }]; 
    
    const survey = {
      id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
      type: 'CURRICULUM',
      title: 'Test Survey',
      description: 'This is a testing survey',
      startTime: new Date(2024, 1, 2),
      endTime: new Date(2024, 2, 2),
      admissionYearFrom: 2019,
      admissionYearTo: 2019,
      graduateYearFrom: 2023,
      graduateYearTo: 2023,
      questions: question
    };
    
    it('should successfully return a survey', async () => {
      surveyServiceMock.getSurvey.mockResolvedValue(survey)

      const result = await surveyController.getSurvey
    });

  });
});
