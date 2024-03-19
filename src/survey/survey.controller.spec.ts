import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

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

  describe('DELETE /survey', () => {
    const id = 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef';
    const nonExistentId = 'notExist';

    it('should successfully delete a survey', async () => {
      surveyServiceMock.delete.mockResolvedValue(id);
      const result = await surveyController.delete(id);

      expect(result).toEqual({
        id,
        message: 'Deleted survey successfully'
      });

      expect(surveyServiceMock.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException for a non-existing survey', async () => {
      surveyServiceMock.delete.mockRejectedValue(new NotFoundException('Survey not found'));
      
      await expect(surveyController.delete(id)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle errors during deletion', async () => {
      surveyServiceMock.delete.mockRejectedValue(
        new InternalServerErrorException('Error while deleting survey')
      );

      await expect(surveyController.delete(id)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
