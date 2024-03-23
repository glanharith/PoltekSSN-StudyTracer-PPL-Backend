import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from './survey.service';
import { DeepMockProxy } from 'jest-mock-extended';
import { Form, PrismaClient, Question } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSurveyDTO,
  OptionDTO,
  QuestionDTO,
  EditSurveyDTO,
} from './DTO/CreateSurveyDTO';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { BadRequestException } from '@nestjs/common';

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

  const existingQuestionText: QuestionDTO = {
    id: 'uuid',
    ...questionText,
  };

  const existingQuestionRadio: QuestionDTO = {
    id: 'uuid',
    ...questionRadio,
  };

  const existingQuestionCheckbox: QuestionDTO = {
    id: 'uuid',
    ...questionCheckbox,
  };

  const existingQuestionRange: QuestionDTO = {
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
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
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
        prismaMockTx.question.findMany.mockResolvedValue(mockQuestion);
        prismaMockTx.form.update.mockResolvedValue({ id: 'id' } as Form);
        await callback(prismaMockTx);
      });

      await surveyService.editSurvey(surveyId, editSurveyDTO);
    });

    it('should check if the updated question exists in the form', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.question.findMany.mockResolvedValue([]);
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
        updateQuestions: [
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
        updateQuestions: [
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
        updateQuestions: [
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
        updateQuestions: [
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
        updateQuestions: [
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
        updateQuestions: [
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
  });
});
