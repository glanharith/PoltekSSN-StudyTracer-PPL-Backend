import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from './survey.service';
import { DeepMockProxy } from 'jest-mock-extended';
import { Form, PrismaClient, FormType, Question } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSurveyDTO,
  OptionDTO,
  QuestionDTO,
  EditSurveyDTO,
  ExistingQuestionDTO,
} from './DTO/SurveyDTO';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SurveyService', () => {
  let surveyService: SurveyService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    surveyService = module.get<SurveyService>(SurveyService);
  });

  const optionRadio1: OptionDTO = {
    label: 'Option Radio 1',
    order: 1,
  };

  const optionRadio2: OptionDTO = {
    label: 'Option Radio 2',
    order: 2,
  };

  const optionCheckbox1: OptionDTO = {
    label: 'Option Checkbox 1',
    order: 1,
  };

  const optionCheckbox2: OptionDTO = {
    label: 'Option Checkbox 2',
    order: 2,
  };

  const questionText: QuestionDTO = {
    type: 'TEXT',
    question: 'Question Text',
    order: 1,
  };

  const questionRadio: QuestionDTO = {
    type: 'RADIO',
    question: 'Question Radio',
    order: 2,
    options: [optionRadio1, optionRadio2],
  };

  const questionCheckbox: QuestionDTO = {
    type: 'CHECKBOX',
    question: 'Question Checkbox',
    order: 3,
    options: [optionCheckbox1, optionCheckbox2],
  };

  const questionRange: QuestionDTO = {
    type: 'RANGE',
    question: 'Question Range',
    rangeFrom: 1,
    rangeTo: 5,
    order: 4,
  };

  const createSurveyDTO: CreateSurveyDTO = {
    type: 'CURRICULUM',
    title: 'title',
    description: 'description',
    startTime: new Date(2024, 0, 1),
    endTime: new Date(2024, 1, 1),
    questions: [questionText, questionRadio, questionCheckbox, questionRange],
  };

  const existingQuestionText: ExistingQuestionDTO = {
    id: 'uuid',
    ...questionText,
  };

  const existingQuestionRadio: ExistingQuestionDTO = {
    id: 'uuid',
    ...questionRadio,
  };

  const existingQuestionCheckbox: ExistingQuestionDTO = {
    id: 'uuid',
    ...questionCheckbox,
  };

  const existingQuestionRange: ExistingQuestionDTO = {
    id: 'uuid',
    ...questionRange,
  };

  const newQuestionText: QuestionDTO = {
    ...questionText,
    order: 5,
  };

  const newQuestionRadio: QuestionDTO = {
    ...questionRadio,
    order: 6,
  };

  const newQuestionCheckbox: QuestionDTO = {
    ...questionCheckbox,
    order: 7,
  };

  const newQuestionRange: QuestionDTO = {
    ...questionRange,
    order: 8,
  };
  const surveyId = 'b3eb1541-79cb-432f-a1fb-2101044eff81';

  const editSurveyDTO: EditSurveyDTO = {
    title: 'title',
    type: 'CAREER',
    description: 'description',
    startTime: new Date(2024, 0, 1),
    endTime: new Date(2024, 1, 1),
    newQuestions: [
      newQuestionText,
      newQuestionRadio,
      newQuestionCheckbox,
      newQuestionRange,
    ],
    updateQuestions: [
      existingQuestionText,
      existingQuestionRange,
      existingQuestionRadio,
      existingQuestionCheckbox,
    ],
    deleteQuestions: [{ id: 'uuid' }],
  };

  const surveyTest: Form = {
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
  };

  describe('create survey', () => {
    it('should create survey successfully', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.form.create.mockResolvedValue({ id: 'id' } as Form);
        await callback(prismaMockTx);
      });

      await surveyService.createSurvey(createSurveyDTO);
    });

    it('should validate start and end time', async () => {
      const createSurveyDTOWithInvalidTime: CreateSurveyDTO = {
        ...createSurveyDTO,
        startTime: new Date(2024, 1, 1),
        endTime: new Date(2024, 0, 1),
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidTime),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate admission year', async () => {
      const createSurveyDTOWithInvalidAdmissionYear: CreateSurveyDTO = {
        ...createSurveyDTO,
        admissionYearFrom: 2024,
        admissionYearTo: 2023,
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidAdmissionYear),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate graduate year', async () => {
      const createSurveyDTOWithInvalidGraduateYear: CreateSurveyDTO = {
        ...createSurveyDTO,
        graduateYearFrom: 2024,
        graduateYearTo: 2023,
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidGraduateYear),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate question order', async () => {
      const createSurveyDTOWithInvalidQuestionOrder: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, order: 1 },
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidQuestionOrder),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate radio option', async () => {
      const createSurveyDTOWithNoRadioOption: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          { ...questionRadio, options: [] },
          questionCheckbox,
          questionRange,
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithNoRadioOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate checkbox option', async () => {
      const createSurveyDTOWithNoCheckboxOption: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          questionRadio,
          { ...questionCheckbox, options: [] },
          questionRange,
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithNoCheckboxOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate option order', async () => {
      const createSurveyDTOWithInvalidOptionOrder: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          {
            ...questionRadio,
            options: [optionRadio1, { ...optionRadio2, order: 1 }],
          },
          questionCheckbox,
          questionRange,
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidOptionOrder),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate rangeFrom and rangeTo', async () => {
      const createSurveyDTOWithoutRange: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, rangeFrom: undefined, rangeTo: undefined },
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithoutRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate range', async () => {
      const createSurveyDTOWithInvalidRange: CreateSurveyDTO = {
        ...createSurveyDTO,
        questions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, rangeFrom: 5, rangeTo: 1 },
        ],
      };

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });
  });

  describe('edit survey', () => {
    it('should edit survey successfully', async () => {
      const mockQuestion: Question[] = [
        {
          id: 'uuid',
          type: 'RANGE',
          question: 'question',
          rangeFrom: 1,
          rangeTo: 5,
          order: 1,
          formId: 'uuid',
        },
      ];
      prismaMock.question.findMany.mockResolvedValue(mockQuestion);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.form.update.mockResolvedValue({ id: 'id' } as Form);
        await callback(prismaMockTx);
      });

      await surveyService.editSurvey(surveyId, editSurveyDTO);
    });

    it('should check if the updated question exists in the form', async () => {
      prismaMock.question.findMany.mockResolvedValue([]);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        await callback(prismaMockTx);
      });

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate start and end time', async () => {
      const editSurveyDTOWithInvalidTime: EditSurveyDTO = {
        ...editSurveyDTO,
        startTime: new Date(2024, 1, 1),
        endTime: new Date(2024, 0, 1),
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithInvalidTime),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate admission year', async () => {
      const editSurveyDTOWithInvalidAdmissionYear: EditSurveyDTO = {
        ...editSurveyDTO,
        admissionYearFrom: 2024,
        admissionYearTo: 2023,
      };

      await expect(
        surveyService.editSurvey(
          surveyId,
          editSurveyDTOWithInvalidAdmissionYear,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate graduate year', async () => {
      const editSurveyDTOWithInvalidGraduateYear: EditSurveyDTO = {
        ...editSurveyDTO,
        graduateYearFrom: 2024,
        graduateYearTo: 2023,
      };

      await expect(
        surveyService.editSurvey(
          surveyId,
          editSurveyDTOWithInvalidGraduateYear,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate question order', async () => {
      const editSurveyDTOWithInvalidQuestionOrder: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, order: 1 },
        ],
      };

      await expect(
        surveyService.editSurvey(
          surveyId,
          editSurveyDTOWithInvalidQuestionOrder,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate radio option', async () => {
      const editSurveyDTOWithNoRadioOption: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          { ...questionRadio, options: [] },
          questionCheckbox,
          questionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithNoRadioOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate checkbox option', async () => {
      const editSurveyDTOWithNoCheckboxOption: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          questionRadio,
          { ...questionCheckbox, options: [] },
          questionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithNoCheckboxOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate option order', async () => {
      const editSurveyDTOWithInvalidOptionOrder: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          {
            ...questionRadio,
            options: [optionRadio1, { ...optionRadio2, order: 1 }],
          },
          questionCheckbox,
          questionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithInvalidOptionOrder),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate rangeFrom and rangeTo', async () => {
      const editSurveyDTOWithoutRange: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, rangeFrom: undefined, rangeTo: undefined },
        ],
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithoutRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate range', async () => {
      const editSurveyDTOWithInvalidRange: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [
          questionText,
          questionRadio,
          questionCheckbox,
          { ...questionRange, rangeFrom: 5, rangeTo: 1 },
        ],
      };

      await expect(
        surveyService.editSurvey(surveyId, editSurveyDTOWithInvalidRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    describe('delete', () => {
      const id = surveyTest.id;
      const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
      const invalidUUID = 'invalid-uuid';

      it('should successfully delete a survey', async () => {
        prismaMock.form.findUnique.mockResolvedValue(surveyTest);
        prismaMock.form.delete.mockResolvedValue(surveyTest);

        expect(await surveyService.deleteSurvey(id)).toEqual(id);
        expect(prismaMock.form.delete).toHaveBeenCalledWith({
          where: {
            id: surveyTest.id,
          },
        });
      });

      it('should throw NotFoundException if survey is not found', async () => {
        prismaMock.form.findUnique.mockResolvedValue(null);

        await expect(surveyService.deleteSurvey(nonExistentId)).rejects.toThrow(
          NotFoundException,
        );
        expect(prismaMock.form.delete).toHaveBeenCalledTimes(0);
      });

      it('should throw BadRequestException if ID is not a valid UUID', async () => {
        await expect(surveyService.deleteSurvey(invalidUUID)).rejects.toThrow(
          BadRequestException,
        );
      });

      it("should not delete a survey if the current date is within the survey's active period", async () => {
        jest.useFakeTimers().setSystemTime(new Date(2024, 1, 15));

        prismaMock.form.findUnique.mockResolvedValue(surveyTest);

        await expect(surveyService.deleteSurvey(id)).rejects.toThrow(
          BadRequestException,
        );

        expect(prismaMock.form.delete).toHaveBeenCalledTimes(0);

        jest.useRealTimers();
      });
    });
  });

  describe('get survey', () => {
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

    const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
    const invalidUUID = 'invalid-uuid';

    it('should return a survey', async () => {
      prismaMock.form.findUnique.mockResolvedValue(survey);

      expect(await surveyService.getSurvey(survey.id)).toEqual(survey);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.form.findUnique).toHaveBeenCalledWith({
        where: {
          id: survey.id,
        },
        include: {
          questions: {
            include: {
              option: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if survey is not found', async () => {
      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(surveyService.getSurvey(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if ID is not a valid UUID', async () => {
      await expect(surveyService.getSurvey(invalidUUID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('get all surveys', () => {
    it('should return all surveys', async () => {
      const surveysMock = [surveyTest];

      prismaMock.form.findMany.mockResolvedValue(surveysMock);

      const result = await surveyService.getAllSurveys();

      expect(result).toEqual(surveysMock);
      expect(prismaMock.form.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAvailableSurveyByYear', () => {
    const startTime = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
    );
    const endTime = new Date(startTime.getDate() + 3);
  
    const survey = {
      id: '9999cca4-8997-4880-ac67-9768ede6e2a3',
      type: FormType.CURRICULUM,
      title: 'Test Survey',
      description: 'Test',
      startTime: startTime,
      endTime: endTime,
      admissionYearFrom: 2020,
      admissionYearTo: 2023,
      graduateYearFrom: 2024,
      graduateYearTo: 2027,
    };
    
    it('should return surveys for a given admission and graduate year within 7 days before start date and before end time', async () => {
      const admissionYear = '2020';
      const graduateYear = '2025';
      const surveysMock = [survey];

      prismaMock.form.findMany.mockResolvedValue(surveysMock);

      const result = await surveyService.getAvailableSurveyByYear(
        admissionYear,
        graduateYear,
      );

      expect(result).toEqual(surveysMock);
    });

    it('should throw BadRequestException if admissionYear or graduateYear is invalid', async () => {
      const admissionYear = 'invalid';
      const graduateYear = '2024';

      await expect(
        surveyService.getAvailableSurveyByYear(admissionYear, graduateYear),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.form.findMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if graduateYear is less than admissionYear', async () => {
      const admissionYear = '2025';
      const graduateYear = '2024';
      
      await expect(
        surveyService.getAvailableSurveyByYear(admissionYear, graduateYear),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.form.findMany).not.toHaveBeenCalled();
    });
  });

  describe('get survey for alumni', () => {
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
        option: option,
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

    const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
    const invalidUUID = 'invalid-uuid';

    it('should return a survey', async () => {
      prismaMock.form.findUnique.mockResolvedValue(survey);

      expect(await surveyService.getSurveyById(survey.id)).toEqual(survey);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.form.findUnique).toHaveBeenCalledWith({
        where: {
          id: survey.id,
        },
        include: {
          questions: {
            include: {
              option: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if survey is not found', async () => {
      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(surveyService.getSurveyById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if ID is not a valid UUID', async () => {
      await expect(surveyService.getSurveyById(invalidUUID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
