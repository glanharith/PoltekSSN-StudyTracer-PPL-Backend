import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from './survey.service';
import { DeepMockProxy } from 'jest-mock-extended';
import { Form, Option, PrismaClient, Question } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
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

  const form: Form = {
    id: 'formId',
    type: 'CURRICULUM',
    title: 'title',
    description: 'description',
    startTime: new Date(2024, 0, 1),
    endTime: new Date(2024, 1, 1),
    admissionYearFrom: null,
    admissionYearTo: null,
    graduateYearFrom: null,
    graduateYearTo: null,
  };

  const questionText: Question = {
    id: 'questionTextId',
    type: 'TEXT',
    question: 'Question Text',
    rangeFrom: null,
    rangeTo: null,
    order: 1,
    formId: form.id,
  };

  const questionRadio: Question = {
    id: 'questionRadioId',
    type: 'RADIO',
    question: 'Question Radio',
    rangeFrom: null,
    rangeTo: null,
    order: 2,
    formId: form.id,
  };

  const questionCheckbox: Question = {
    id: 'questionCheckboxId',
    type: 'CHECKBOX',
    question: 'Question Checkbox',
    rangeFrom: null,
    rangeTo: null,
    order: 3,
    formId: form.id,
  };

  const questionRange: Question = {
    id: 'questionRangeId',
    type: 'RANGE',
    question: 'Question Range',
    rangeFrom: 1,
    rangeTo: 5,
    order: 4,
    formId: form.id,
  };

  const optionRadio1: Option = {
    id: 'optionRadio1',
    label: 'Option Radio 1',
    questionId: questionRadio.id,
    order: 1,
  };

  const optionRadio2: Option = {
    id: 'optionRadio2',
    label: 'Option Radio 2',
    questionId: questionRadio.id,
    order: 2,
  };

  const optionCheckbox1: Option = {
    id: 'optionCheckbox1',
    label: 'Option Checkbox 1',
    questionId: questionCheckbox.id,
    order: 1,
  };

  const optionCheckbox2: Option = {
    id: 'optionCheckbox2',
    label: 'Option Checkbox 2',
    questionId: questionCheckbox.id,
    order: 2,
  };

  describe('create survey', () => {
    const createSurveyDTO = {
      ...form,
      questions: [
        questionText,
        { ...questionRadio, options: [optionRadio1, optionRadio2] },
        { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
        questionRange,
      ],
    } as CreateSurveyDTO;

    it('should create survey successfully', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.form.create.mockResolvedValue(form);
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
      const createSurveyDTOWithInvalidQuestionOrder = {
        ...createSurveyDTO,
        questions: [
          questionText,
          { ...questionRadio, options: [optionRadio1, optionRadio2] },
          { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
          { ...questionRange, order: 1 },
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidQuestionOrder),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate radio option', async () => {
      const createSurveyDTOWithNoRadioOption = {
        ...createSurveyDTO,
        questions: [
          questionText,
          { ...questionRadio, options: [] },
          { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
          questionRange,
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithNoRadioOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate checkbox option', async () => {
      const createSurveyDTOWithNoCheckboxOption = {
        ...createSurveyDTO,
        questions: [
          questionText,
          { ...questionRadio, options: [optionRadio1, optionRadio2] },
          { ...questionCheckbox, options: [] },
          questionRange,
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithNoCheckboxOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate option order', async () => {
      const createSurveyDTOWithInvalidOptionOrder = {
        ...createSurveyDTO,
        questions: [
          questionText,
          {
            ...questionRadio,
            options: [optionRadio1, { ...optionRadio2, order: 1 }],
          },
          { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
          questionRange,
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidOptionOrder),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate rangeFrom and rangeTo', async () => {
      const createSurveyDTOWithoutRange = {
        ...createSurveyDTO,
        questions: [
          questionText,
          {
            ...questionRadio,
            options: [optionRadio1, optionRadio2],
          },
          { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
          { ...questionRange, rangeFrom: undefined, rangeTo: undefined },
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithoutRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate range', async () => {
      const createSurveyDTOWithInvalidRange = {
        ...createSurveyDTO,
        questions: [
          questionText,
          {
            ...questionRadio,
            options: [optionRadio1, optionRadio2],
          },
          { ...questionCheckbox, options: [optionCheckbox1, optionCheckbox2] },
          { ...questionRange, rangeFrom: 5, rangeTo: 1 },
        ],
      } as CreateSurveyDTO;

      await expect(
        surveyService.createSurvey(createSurveyDTOWithInvalidRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });
  });
});
