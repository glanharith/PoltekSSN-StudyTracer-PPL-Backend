import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { CreateSurveyDTO, EditSurveyDTO } from './DTO/SurveyDTO';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Alumni,
  Answer,
  FormType,
  Gender,
  QuestionType,
  Response,
} from '@prisma/client';
import { FillSurveyDTO } from './DTO/FIllSurveyDTO';

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

  const email = 'test@gmail.com';

  const option = [
    {
      id: '7392cca4-8997-4880-ac67-9768ede6e2a3',
      label: 'option',
      questionId: '1222cca4-8997-4880-ac67-9768ede6e2a3',
      order: 0,
    },
  ];

  const question = [
    {
      id: '1222cca4-8997-4880-ac67-9768ede6e2a3',
      type: 'RADIO',
      question: 'How good is the curriculum?',
      order: 0,
      formId: '9999cca4-8997-4880-ac67-9768ede6e2a3',
      options: option,
    },
  ];

  const survey = {
    id: '9999cca4-8997-4880-ac67-9768ede6e2a3',
    type: FormType.CURRICULUM,
    title: 'Test Survey',
    description: 'Test',
    startTime: new Date(2024, 3, 22),
    endTime: new Date(2024, 4, 22),
    admissionYearFrom: 2020,
    admissionYearTo: 2023,
    graduateYearFrom: 2024,
    graduateYearTo: 2027,
    questions: question,
  };

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

  describe('POST /fill-survey', () => {
    const fillSurveyDTO: FillSurveyDTO = {
      'ini-id-question': 'ini jawaban',
    };

    it('should return success message', async () => {
      surveyServiceMock.fillSurvey.mockResolvedValue();

      const result = await surveyController.fillSurvey(
        {
          user: { email: email },
        },
        fillSurveyDTO,
      );

      expect(result).toEqual({ message: 'Survey successfully filled' });
    });

    it('should throw notFoundException', async () => {
      surveyServiceMock.fillSurvey.mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        surveyController.fillSurvey(
          {
            user: { email: email },
          },
          fillSurveyDTO,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw badRequest', async () => {
      surveyServiceMock.fillSurvey.mockRejectedValue(
        new BadRequestException('Bad request'),
      );

      await expect(
        surveyController.fillSurvey(
          {
            user: { email: email },
          },
          fillSurveyDTO,
        ),
      ).rejects.toThrow(BadRequestException);
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
          id: 'uuid',
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
        surveyServiceMock.deleteSurvey.mockRejectedValue(
          new NotFoundException('Survey not found'),
        );

        await expect(
          surveyController.deleteSurvey(nonExistentId),
        ).rejects.toThrow(NotFoundException);
      });

      it('should handle errors during deletion', async () => {
        surveyServiceMock.deleteSurvey.mockRejectedValue(
          new InternalServerErrorException('Error while deleting survey'),
        );

        await expect(surveyController.deleteSurvey(id)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('GET /survey/get/:surveyId', () => {
    const option = [
      {
        id: 'da20eb7a-8667-4a82-a18d-47aca6cf84ef',
        label: '21',
        questionId: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
        order: 0,
      },
    ];

    const question = [
      {
        id: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
        type: QuestionType.RADIO,
        question: 'What is 9 + 10',
        order: 0,
        formId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        rangeFrom: null,
        rangeTo: null,
        options: option,
      },
    ];

    const survey = {
      id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
      type: FormType.CURRICULUM,
      title: 'Test Survey',
      description: 'This is a testing survey',
      startTime: new Date(2024, 1, 2),
      endTime: new Date(2024, 2, 2),
      admissionYearFrom: 2019,
      admissionYearTo: 2019,
      graduateYearFrom: 2023,
      graduateYearTo: 2023,
      questions: question,
    };

    it('should return survey when id is valid', async () => {
      surveyServiceMock.getSurveyForFill.mockResolvedValue(survey);
      const res = await surveyController.getSurveyForAlumni(
        {
          user: { email: email },
        },
        survey.id,
      );
      expect(res).toEqual(survey);
    });

    it('should return NotFoundException for non-existing survey', async () => {
      surveyServiceMock.getSurveyForFill.mockRejectedValue(
        new NotFoundException('Survey not found'),
      );

      await expect(
        surveyController.getSurveyForAlumni(
          {
            user: { email: email },
          },
          survey.id,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during get', async () => {
      surveyServiceMock.getSurveyForFill.mockRejectedValue(
        new InternalServerErrorException('Error while retrieving survey'),
      );

      await expect(
        surveyController.getSurveyForAlumni(
          {
            user: { email: email },
          },
          survey.id,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('GET /survey/:id', () => {
    const option = [
      {
        id: 'da20eb7a-8667-4a82-a18d-47aca6cf84ef',
        label: '21',
        questionId: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
        order: 0,
      },
    ];

    const question = [
      {
        id: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
        type: 'RADIO',
        question: 'What is 9 + 10',
        order: 0,
        formId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        rangeFrom: null,
        rangeTo: null,
        options: option,
      },
    ];

    const survey = {
      id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
      type: FormType.CURRICULUM,
      title: 'Test Survey',
      description: 'This is a testing survey',
      startTime: new Date(2024, 1, 2),
      endTime: new Date(2024, 2, 2),
      admissionYearFrom: 2019,
      admissionYearTo: 2019,
      graduateYearFrom: 2023,
      graduateYearTo: 2023,
      questions: question,
    };

    it('should successfully return a survey', async () => {
      surveyServiceMock.getSurvey.mockResolvedValue(survey);

      const result = await surveyController.getSurvey(survey.id);

      expect(result).toEqual(survey);
    });

    it('should return NotFoundException for non-existing survey', async () => {
      surveyServiceMock.getSurvey.mockRejectedValue(
        new NotFoundException('Survey not found'),
      );

      await expect(surveyController.getSurvey(survey.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle errors during get', async () => {
      surveyServiceMock.getSurvey.mockRejectedValue(
        new InternalServerErrorException('Error while retrieving survey'),
      );

      await expect(surveyController.getSurvey(survey.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('GET /survey/all', () => {
    it('should return all surveys', async () => {
      const surveysMock = [survey];
      surveyServiceMock.getAllSurveys.mockResolvedValue(surveysMock);

      const result = await surveyController.getAllSurveys();

      expect(result).toEqual({
        message: 'Successfully got all surveys',
        data: surveysMock,
      });
    });
  });

  describe('GET /survey?admissionYear=<tahun>&graduateYear=<tahun>', () => {
    it('should return surveys for a given admission and graduate year', async () => {
      const admissionYear = '2021';
      const graduateYear = '2025';
      const surveysMock = [survey];
      surveyServiceMock.getAvailableSurveyByYear.mockResolvedValue(surveysMock);

      const result = await surveyController.getAvailableSurveyByYear(
        admissionYear,
        graduateYear,
      );

      expect(result).toEqual({
        message: `Successfully got surveys for admission year ${admissionYear} and graduate year ${graduateYear}`,
        data: surveysMock,
      });
    });
  });

  describe('GET /survey/:id/response-review/questions', () => {
    const id = survey.id;
    const responseData = {
      title: 'survey title',
      totalRespondents: 2,
      answerStats: Promise.resolve([
        {
          question: 'Berapa tinggi kamu?',
          questionType: 'TEXT',
          data: ['198', '167']
        },
        {
          question: 'Apa gender kamu?',
          questionType: 'RADIO',
          data: [
            {
              optionLabel: 'Laki-laki',
              optionAnswersCount: 1,
              percentage: "50.00%"
            },
            {
              optionLabel: 'Perempuan',
              optionAnswersCount: 1,
              percentage: "50.00%"
            }
          ]
        }
      ])
    };

    it('should return responses data of a survey', async () => {
      surveyServiceMock.getSurveyResponseByQuestions.mockResolvedValue(responseData);

      const result = await surveyController.getSurveyResponseByQuestions(id);

      expect(result).toEqual(responseData);
    })

    it('should return NotFoundException for non-existing survey', async () => {
      surveyServiceMock.getSurveyResponseByQuestions.mockRejectedValue(
        new NotFoundException(`Survei dengan ID ${id} tidak ditemukan`),
      );

      await expect(surveyController.getSurveyResponseByQuestions(id)).rejects.toThrow(
        NotFoundException,
      );
    })
  })

  describe('GET /:id/response-preview', () => {
    it('should return survey responses', async () => {
      const mockAlumni: Alumni = {
        id: 'b6e02c84-f321-4b4e-bff6-780c8cae17b3',
        phoneNo:
          '$2b$10$89KoyS3YtlCfSsfHiyZTN.HZjngo8VPgztWWHQHkM0A7JqpMuDWgm|b7adb2299b170577|b3b6620444be4ad38531d3eaae8924a4|5a015347e1321163988c75132dfbea5d',
        address:
          '$2b$10$89KoyS3YtlCfSsfHiyZTN.uBMnQX2lluICrEGO9kCMCrTk0NFlEDS|cd4f8f6c4b718dd5|5cad4e104c5c6f639d47a668bed256a2|7ac79c3c1744857d5cdbf1d948db5fbad37f01d68fba6bacb5cb50b409d29333',
        gender: Gender.FEMALE,
        enrollmentYear: 2021,
        graduateYear: 2024,
        studyProgramId: '393f6a47-425e-4402-92b6-782d266e0193',
        npm: '2106634331',
      };

      const mockSurvey = {
        id: '65259cd0-b2e2-4ac0-9dd2-847dbd79157b',
        type: FormType.CURRICULUM,
        title: 'Survey buat semua alumni',
        description: 'Survey Description',
        startTime: new Date('2024-03-24T17:00:00.000Z'),
        endTime: new Date('2024-04-24T20:15:00.000Z'),
        admissionYearFrom: null,
        admissionYearTo: null,
        graduateYearFrom: null,
        graduateYearTo: null,
      };

      const mockQuestion = {
        id: '14a4acdc-50b1-477f-90e9-8e0c99e85e58',
        type: QuestionType.TEXT,
        question: 'What is your name?',
        rangeFrom: null,
        rangeTo: null,
        order: 1,
        formId: mockSurvey.id,
      };

      const mockResponse = [{
        id: 'dea1c841-f238-4619-914c-d8b3afe6d47c',
        formId: '65259cd0-b2e2-4ac0-9dd2-847dbd79157b',
        alumniId: 'b6e02c84-f321-4b4e-bff6-780c8cae17b3',
        alumni: mockAlumni,
        answers: [
          {
            id: 'e1c3b99e-576b-4b81-976f-a949797de075',
            answer: 'rafaaa',
            responseId: 'dea1c841-f238-4619-914c-d8b3afe6d47c',
            questionId: '14a4acdc-50b1-477f-90e9-8e0c99e85e58',
            question: mockQuestion,
          },
        ],
      }];
      
      surveyServiceMock.getSurveyResponses.mockResolvedValue(mockResponse);

      const result = await surveyController.getSurveyResponse(mockSurvey.id);

      expect(result).toEqual({
        message: `Successfully got responses for survey ${mockSurvey.id}`,
        data: mockResponse,
      });
    });
  });
});
