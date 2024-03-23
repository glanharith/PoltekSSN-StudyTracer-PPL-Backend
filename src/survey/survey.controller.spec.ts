import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO, EditSurveyDTO } from './DTO/CreateSurveyDTO';

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

  describe('PATCH /survey', () => {
    const surveyId = 'uuid';
    const editSurveyDTO: EditSurveyDTO = {
      title: 'title',
      type: 'CURRICULUM',
      description: 'description',
      startTime: new Date(2024, 0, 1),
      endTime: new Date(2024, 1, 1),
      newQuestions: [
        {
          type: 'TEXT',
          question: 'Question',
          order: 2,
        },
      ],
      updateQuestions: [
        {
          type: 'TEXT',
          question: 'Question',
          order: 1,
        },
      ],
      deleteQuestions: [
        {
          id: 'uuid',
        },
      ],
    };

    it('should return success message', async () => {
      surveyServiceMock.editSurvey.mockResolvedValue();

      const result = await surveyController.editSurvey(surveyId, editSurveyDTO);

      expect(result).toEqual({ message: 'Survey successfully updated' });
    });
  });
});
