import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from './survey.service';
import { DeepMockProxy } from 'jest-mock-extended';
import {
  Form,
  PrismaClient,
  FormType,
  Question,
  Option,
  User,
  Alumni,
  Response,
  QuestionType,
  StudyProgram,
  Answer,
  Role,
  StudyProgramLevel,
  HeadStudyProgram,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSurveyDTO,
  OptionDTO,
  QuestionDTO,
  EditSurveyDTO,
  ExistingQuestionDTO,
  ExistingOptionDTO,
} from './DTO/SurveyDTO';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FillSurveyDTO } from './DTO/FIllSurveyDTO';

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

  const mockOption: Option = {
    id: 'uuid',
    questionId: 'uuid',
    label: 'label',
    order: 1,
  };

  const optionRadio1: OptionDTO = {
    label: 'Option Radio 1',
    order: 1,
  };

  const optionRadio2: OptionDTO = {
    label: 'Option Radio 2',
    order: 2,
  };

  const existingOptionRadio1: ExistingOptionDTO = {
    id: 'uuid',
    ...optionRadio1,
    order: 3,
  };

  const existingOptionRadio2: ExistingOptionDTO = {
    id: 'uuid',
    ...optionRadio2,
    order: 4,
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
    type: 'RADIO',
    question: 'Question Radio',
    order: 2,
    newOptions: [optionRadio1, optionRadio2],
  };

  const existingQuestionCheckbox: ExistingQuestionDTO = {
    id: 'uuid',
    type: 'CHECKBOX',
    question: 'Question Checkbox',
    order: 3,
    newOptions: [optionCheckbox1, optionCheckbox2],
    updateOptions: [existingOptionRadio1, existingOptionRadio2],
    deleteOptions: [{ id: 'uuid' }],
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

  const mockQuestion: Question & { options: Option[] } = {
    id: 'uuid',
    type: 'RADIO',
    question: 'What is 9 + 10',
    order: 0,
    formId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
    rangeFrom: null,
    rangeTo: null,
    options: [mockOption],
  };

  const mockSurvey: Form & {
    questions: Question[];
    _count: {
      responses: number;
    };
    responses: { alumni: { studyProgramId: string } }[];
  } = {
    id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
    type: FormType.CURRICULUM,
    title: 'Test Survey',
    description: 'This is a testing survey',
    startTime: new Date(2024, 1, 2),
    endTime: new Date(2024, 2, 2),
    admissionYearFrom: 2018,
    admissionYearTo: 2021,
    graduateYearFrom: 2022,
    graduateYearTo: 2025,
    questions: [mockQuestion],
    _count: {
      responses: 1,
    },
    responses: [
      {
        alumni: {
          studyProgramId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        },
      },
    ],
  };

  const mockAlumni: Alumni = {
    id: 'ed036827-2df3-4c45-8323-0eb43627f7f1',
    phoneNo:
      '$2b$10$89KoyS3YtlCfSsfHiyZTN.WtVfnFZ9U/.nMeXDtqedgwDE0Mj8kvy|92d362f959534bab|fc54298b1aa9f0ca3bb3e0d997bc3685|000a68a2793d43b622eba0361b458d44',
    address:
      '$2b$10$89KoyS3YtlCfSsfHiyZTN.Y2yh6rIYemKlZchKh6gMZxXoNWaRYn.|3528eed66ca856ae|b3157b4ecd41ddc884e86e6b01d5129d|6b96c85f4e36a2783045980c4bc6293a9fb29c7206b15cae60301c45aabbf41b48d1adcc6eddedd5e9cf2b77992bb491f67e2dfe473f3e1283a02bc7f8412ae7cacd7a24671b2e8e48579e42d7e50209',
    gender: 'MALE',
    enrollmentYear: 2021,
    graduateYear: 2025,
    studyProgramId: '2fa34067-d271-4ea4-9074-dedb3c99cb3a',
    npm: '1312452141',
  };

  const mockUser: User = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    email: 'email@email.com',
    password: 'currentPassword',
    name: 'user',
    role: 'ALUMNI',
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
      prismaMock.option.findMany.mockResolvedValue([mockOption]);
      prismaMock.question.findMany.mockResolvedValue([mockQuestion]);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.form.update.mockResolvedValue({ id: 'id' } as Form);
        await callback(prismaMockTx);
      });

      await surveyService.editSurvey(mockSurvey.id, editSurveyDTO);
    });

    it('should check if the updated or deleted option exists in the updated question', async () => {
      prismaMock.option.findMany.mockResolvedValue([]);

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should check if the updated or deleted question exists in the form', async () => {
      prismaMock.option.findMany.mockResolvedValue([mockOption]);
      prismaMock.question.findMany.mockResolvedValue([]);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        await callback(prismaMockTx);
      });

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate start and end time', async () => {
      const editSurveyDTOWithInvalidTime: EditSurveyDTO = {
        ...editSurveyDTO,
        startTime: new Date(2024, 1, 1),
        endTime: new Date(2024, 0, 1),
      };

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithInvalidTime),
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
          mockSurvey.id,
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
          mockSurvey.id,
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
          mockSurvey.id,
          editSurveyDTOWithInvalidQuestionOrder,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate existing question order', async () => {
      const editSurveyDTOWithInvalidQuestionOrder: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [questionText, questionRadio, questionCheckbox],
        updateQuestions: [{ ...existingQuestionRange, order: 1 }],
      };

      await expect(
        surveyService.editSurvey(
          mockSurvey.id,
          editSurveyDTOWithInvalidQuestionOrder,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate new radio option', async () => {
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
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithNoRadioOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate existing radio option', async () => {
      const editSurveyDTOWithNoRadioOption: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [],
        updateQuestions: [
          existingQuestionText,
          { ...existingQuestionRadio, newOptions: [], updateOptions: [] },
          existingQuestionCheckbox,
          existingQuestionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithNoRadioOption),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate new checkbox option', async () => {
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
        surveyService.editSurvey(
          mockSurvey.id,
          editSurveyDTOWithNoCheckboxOption,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate existing checkbox option', async () => {
      prismaMock.option.findMany.mockResolvedValue([mockOption]);
      const editSurveyDTOWithNoCheckboxOption: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [],
        updateQuestions: [
          existingQuestionText,
          existingQuestionRadio,
          { ...existingQuestionCheckbox, newOptions: [], updateOptions: [] },
          existingQuestionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(
          mockSurvey.id,
          editSurveyDTOWithNoCheckboxOption,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate option order of a new question', async () => {
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
        surveyService.editSurvey(
          mockSurvey.id,
          editSurveyDTOWithInvalidOptionOrder,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate option order of an existing question', async () => {
      const editSurveyDTOWithInvalidOptionOrder: EditSurveyDTO = {
        ...editSurveyDTO,
        newQuestions: [],
        updateQuestions: [
          existingQuestionText,
          {
            ...existingQuestionRadio,
            newOptions: undefined,
            updateOptions: [
              existingOptionRadio1,
              { ...existingOptionRadio2, order: 3 },
            ],
          },
          existingQuestionCheckbox,
          existingQuestionRange,
        ],
      };

      await expect(
        surveyService.editSurvey(
          mockSurvey.id,
          editSurveyDTOWithInvalidOptionOrder,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate rangeFrom and rangeTo of a new question', async () => {
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
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithoutRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate rangeFrom and rangeTo of an existing question', async () => {
      prismaMock.option.findMany.mockResolvedValue([mockOption]);
      const editSurveyDTOWithoutRange: EditSurveyDTO = {
        ...editSurveyDTO,
        updateQuestions: [
          existingQuestionText,
          existingQuestionRadio,
          existingQuestionCheckbox,
          {
            ...existingQuestionRange,
            rangeFrom: undefined,
            rangeTo: undefined,
          },
        ],
      };

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithoutRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate range of a new question', async () => {
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
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithInvalidRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    it('should validate range of an existing question', async () => {
      prismaMock.option.findMany.mockResolvedValue([mockOption]);
      const editSurveyDTOWithInvalidRange: EditSurveyDTO = {
        ...editSurveyDTO,
        updateQuestions: [
          existingQuestionText,
          existingQuestionRadio,
          existingQuestionCheckbox,
          { ...existingQuestionRange, rangeFrom: 5, rangeTo: 1 },
        ],
      };

      await expect(
        surveyService.editSurvey(mockSurvey.id, editSurveyDTOWithInvalidRange),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.$transaction).toBeCalledTimes(0);
    });

    describe('delete', () => {
      const id = mockSurvey.id;
      const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
      const invalidUUID = 'invalid-uuid';

      it('should successfully delete a survey', async () => {
        prismaMock.form.findUnique.mockResolvedValue(mockSurvey);
        prismaMock.form.delete.mockResolvedValue(mockSurvey);

        expect(await surveyService.deleteSurvey(id)).toEqual(id);
        expect(prismaMock.form.delete).toHaveBeenCalledWith({
          where: {
            id: mockSurvey.id,
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

        prismaMock.form.findUnique.mockResolvedValue(mockSurvey);

        await expect(surveyService.deleteSurvey(id)).rejects.toThrow(
          BadRequestException,
        );

        expect(prismaMock.form.delete).toHaveBeenCalledTimes(0);

        jest.useRealTimers();
      });
    });
  });

  describe('get survey', () => {
    const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
    const invalidUUID = 'invalid-uuid';

    it('should return a survey', async () => {
      prismaMock.form.findUnique.mockResolvedValue(mockSurvey);

      expect(await surveyService.getSurvey(mockSurvey.id)).toEqual(mockSurvey);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.form.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockSurvey.id,
        },
        include: {
          questions: {
            orderBy: {
              order: 'asc',
            },
            include: {
              options: {
                orderBy: {
                  order: 'asc',
                },
              },
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

  describe('download survey responses', () => {
    const studyProgram: StudyProgram = {
      id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
      name: 'Computer Science',
      code: 'code',
      level: 'D3',
    };

    const alumni: Alumni & { user: User } & { studyProgram: StudyProgram } = {
      ...mockAlumni,
      studyProgram: studyProgram,
      user: mockUser,
    };

    const question = [
      {
        id: 'ca20eb7a-8667-4a82-a18d-47aca6cf84ef',
        type: 'RADIO',
        question: 'What is 9 + 10',
        order: 0,
        formId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        rangeFrom: null,
        rangeTo: null,
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

    const response = {
      id: '0d55baea-a841-4b9b-bf41-392c2b6d60b8',
      formId: 'c75eee37-ced7-4ffd-8322-da086e73a57f',
      alumniId: 'ed036827-2df3-4c45-8323-0eb43627f7f1',
      alumni: alumni,
    };

    const responses = [
      {
        id: '06f8062d-a638-48d7-8e2c-0f6a8f6f56b7',
        answer: 'test',
        responseId: response.id,
        response: response,
        questionId: question[0].id,
        question: question[0],
      },
      {
        id: '35669c91-538b-4c4d-9494-0c406ef0ba40',
        answer: 'test',
        responseId: response.id,
        response: response,
        questionId: question[0].id,
        question: question[0],
      },
      {
        id: 'bec02106-f90f-4e72-a767-c5cc5c765a7a',
        answer: 'test',
        responseId: response.id,
        response: response,
        questionId: question[0].id,
        question: question[0],
      },
    ];

    const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
    const invalidUUID = 'invalid-uuid';

    const request = {
      user: {
        email: 'aaa@gmail.com',
        role: 'ADMIN',
      },
    };

    it('should return a survey response', async () => {
      prismaMock.form.findUnique.mockResolvedValue(survey);
      prismaMock.answer.findMany.mockResolvedValue(responses);

      await surveyService.downloadSurveyResponses(survey.id, request);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.answer.findMany).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if survey is not found', async () => {
      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(
        surveyService.downloadSurveyResponses(nonExistentId, request),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ID is not a valid UUID', async () => {
      await expect(
        surveyService.downloadSurveyResponses(invalidUUID, request),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if survey does not have responses', async () => {
      prismaMock.form.findUnique.mockResolvedValue(survey);
      prismaMock.answer.findMany.mockResolvedValue([]);

      await expect(
        surveyService.downloadSurveyResponses(survey.id, request),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle for kaprodi', async () => {
      const request = {
        email: 'aaa@gmail.com',
        role: 'HEAD_STUDY_PROGRAM',
      };
      const headOfStudyProgram: HeadStudyProgram = {
        id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        studyProgramId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        isActive: true,
        nip: '123',
      };
      prismaMock.form.findUnique.mockResolvedValue(survey);
      prismaMock.headStudyProgram.findFirst.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.answer.findMany.mockResolvedValue(responses);

      await surveyService.downloadSurveyResponses(survey.id, request);
      expect(prismaMock.headStudyProgram.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.answer.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('get all surveys', () => {
    const request = {
      email: 'aaa@gmail.com',
      role: 'ADMIN',
    };

    it('should return all surveys', async () => {
      const surveysMock = [mockSurvey];

      prismaMock.form.findMany.mockResolvedValue(surveysMock);

      const result = await surveyService.getAllSurveys(request);

      expect(result).toEqual(surveysMock);
      expect(prismaMock.form.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return all survey, but modified for kaprodi', async () => {
      const request = {
        email: 'aaa@gmail.com',
        role: 'HEAD_STUDY_PROGRAM',
      };

      const headOfStudyProgram: HeadStudyProgram = {
        id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        studyProgramId: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
        isActive: true,
        nip: '123',
      };

      const surveysMock = [mockSurvey];

      prismaMock.headStudyProgram.findFirst.mockResolvedValue(
        headOfStudyProgram,
      );

      prismaMock.form.findMany.mockResolvedValue(surveysMock);

      const result = await surveyService.getAllSurveys(request);

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
    const user: User & { alumni: Alumni } = {
      ...mockUser,
      alumni: mockAlumni,
    };

    const nonExistentId = '5e2633ba-435d-41e8-8432-efa2832ce564';
    const invalidUUID = 'invalid-uuid';

    it('should return a survey', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 1, 2));

      prismaMock.user.findUnique.mockResolvedValue(user);

      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue(mockSurvey);

      expect(
        await surveyService.getSurveyForFill(mockSurvey.id, 'test@gmail.com'),
      ).toEqual(mockSurvey);
      expect(prismaMock.form.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.form.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockSurvey.id,
        },
        include: {
          questions: {
            include: {
              options: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException if survey is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(
        surveyService.getSurveyForFill(nonExistentId, 'test@gmail.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ID is not a valid UUID', async () => {
      await expect(
        surveyService.getSurveyForFill(invalidUUID, 'test@gmail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('no email', async () => {
      await expect(
        surveyService.getUserByEmail('test@gmail.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('no alumni', async () => {
      await expect(
        surveyService.getAlumni({
          id: '123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('no alumni with Id', async () => {
      await expect(surveyService.getAlumni(user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('the form is not availble now', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 1, 2));

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-04-02T12:56:00.000Z'),
        endTime: new Date('2024-04-02T12:57:00.000Z'),
        admissionYearFrom: null,
        admissionYearTo: null,
        graduateYearFrom: null,
        graduateYearTo: null,
      });

      await expect(
        surveyService.getSurveyForFill(mockSurvey.id, 'test@gmail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('the form enrollment year didnt match', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 4, 4));
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-04-02T12:56:00.000Z'),
        endTime: new Date('2025-04-02T12:57:00.000Z'),
        admissionYearFrom: 1999,
        admissionYearTo: 2000,
        graduateYearFrom: 2003,
        graduateYearTo: 2004,
      });

      await expect(
        surveyService.getSurveyForFill(mockSurvey.id, 'test@gmail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('the form graduate year didnt match', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 4, 4));
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-04-02T12:56:00.000Z'),
        endTime: new Date('2025-04-02T12:57:00.000Z'),
        admissionYearFrom: 2018,
        admissionYearTo: 2022,
        graduateYearFrom: 2022,
        graduateYearTo: 2024,
      });

      await expect(
        surveyService.getSurveyForFill(mockSurvey.id, 'test@gmail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('alumni have filled the same form', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 4, 4));
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-04-02T12:56:00.000Z'),
        endTime: new Date('2025-04-02T12:57:00.000Z'),
        admissionYearFrom: 2018,
        admissionYearTo: 2021,
        graduateYearFrom: 2022,
        graduateYearTo: 2025,
      });
      prismaMock.response.findFirst.mockResolvedValue({
        id: 'hehe',
        formId: 'hehe',
        alumniId: 'jeje',
      });

      await expect(
        surveyService.getSurveyForFill(mockSurvey.id, 'test@gmail.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('fill survey', () => {
    const mockAlumni: Alumni = {
      id: 'ed036827-2df3-4c45-8323-0eb43627f7f1',
      phoneNo:
        '$2b$10$89KoyS3YtlCfSsfHiyZTN.WtVfnFZ9U/.nMeXDtqedgwDE0Mj8kvy|92d362f959534bab|fc54298b1aa9f0ca3bb3e0d997bc3685|000a68a2793d43b622eba0361b458d44',
      address:
        '$2b$10$89KoyS3YtlCfSsfHiyZTN.Y2yh6rIYemKlZchKh6gMZxXoNWaRYn.|3528eed66ca856ae|b3157b4ecd41ddc884e86e6b01d5129d|6b96c85f4e36a2783045980c4bc6293a9fb29c7206b15cae60301c45aabbf41b48d1adcc6eddedd5e9cf2b77992bb491f67e2dfe473f3e1283a02bc7f8412ae7cacd7a24671b2e8e48579e42d7e50209',
      gender: 'MALE',
      enrollmentYear: 1995,
      graduateYear: 1999,
      studyProgramId: '2fa34067-d271-4ea4-9074-dedb3c99cb3a',
      npm: '1312452141',
    };

    const fillSurveyDTO: FillSurveyDTO = {
      'ini-id-question': 'ini jawaban',
    };

    const mockUser: User & { alumni: Alumni } = {
      id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
      email: 'email@email.com',
      password: 'currentPassword',
      name: 'user',
      role: 'ALUMNI',
      alumni: mockAlumni,
    };

    it('success fill survey', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 4, 15));
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-02-02T12:56:00.000Z'),
        endTime: new Date('2025-04-02T12:57:00.000Z'),
        admissionYearFrom: null,
        admissionYearTo: null,
        graduateYearFrom: null,
        graduateYearTo: null,
      });
      prismaMock.question.findUnique.mockResolvedValue({
        id: 'id',
        type: QuestionType.TEXT,
        question: 'ini question',
        rangeFrom: null,
        rangeTo: null,
        order: 1,
        formId: '9423bbe7-f14f-4b02-8654-b15b1c163341',
      });

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const prismaMockTx = createPrismaMock();
        prismaMockTx.response.create.mockResolvedValue({
          id: 'id',
        } as Response);
        await callback(prismaMockTx);
      });

      await surveyService.fillSurvey(fillSurveyDTO, mockUser.email);
    });

    it('Question id is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.form.findUnique.mockResolvedValue({
        id: '9423bbe7-f14f-4b02-8654-b15b1c163341',
        type: 'CURRICULUM',
        title: 'test normal',
        description: 'normal',
        startTime: new Date('2024-04-02T12:56:00.000Z'),
        endTime: new Date('2025-04-02T12:57:00.000Z'),
        admissionYearFrom: null,
        admissionYearTo: null,
        graduateYearFrom: null,
        graduateYearTo: null,
      });

      await expect(
        surveyService.fillSurvey(fillSurveyDTO, mockUser.email),
      ).rejects.toThrow(NotFoundException);
    });

    it('Survey with those question is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.alumni.findUnique.mockResolvedValue(mockAlumni);
      prismaMock.question.findUnique.mockResolvedValue({
        id: 'id',
        type: QuestionType.TEXT,
        question: 'ini question',
        rangeFrom: null,
        rangeTo: null,
        order: 1,
        formId: '9423bbe7-f14f-4b02-8654-b15b1c163341',
      });

      await expect(
        surveyService.fillSurvey(fillSurveyDTO, mockUser.email),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('get survey response by questions', () => {
    const mockSurveyId = '77198ab9-d338-4fa6-9fdc-3f0eb3f4929e';

    it('should return analysis for a survey with responses', async () => {
      const mockSurvey = {
        id: mockSurveyId,
        type: FormType.CURRICULUM,
        description: 'deskripsi survey',
        title: 'Survey test',
        startTime: new Date(2024, 0, 1),
        endTime: new Date(2024, 11, 1),
        admissionYearFrom: 2018,
        admissionYearTo: 2018,
        graduateYearFrom: 2022,
        graduateYearTo: 2022,
        questions: [
          {
            order: 1,
            options: [{ order: 1, label: 'Ya', answers: [{ answer: 'Ya' }] }],
            answers: [{ answer: 'Ya' }],
          },
        ],
      };

      prismaMock.form.findUnique.mockResolvedValue(mockSurvey);
      surveyService.analyzeResponse = jest
        .fn()
        .mockReturnValue('Analysis Data');

      const result = await surveyService.getSurveyResponseByQuestions(
        mockSurveyId,
      );

      expect(result).toEqual({
        title: 'Survey test',
        totalRespondents: 1,
        answerStats: 'Analysis Data',
      });
      expect(surveyService.analyzeResponse).toHaveBeenCalledWith(mockSurvey, 1);
    });

    it('should return message if survey has questions but no responses', async () => {
      const mockSurvey = {
        id: mockSurveyId,
        type: FormType.CURRICULUM,
        description: 'deskripsi survey',
        title: 'Survey no response',
        startTime: new Date(2024, 0, 1),
        endTime: new Date(2024, 11, 1),
        admissionYearFrom: 2018,
        admissionYearTo: 2018,
        graduateYearFrom: 2022,
        graduateYearTo: 2022,
        questions: [
          {
            order: 1,
            options: [],
            answers: [],
          },
        ],
      };

      prismaMock.form.findUnique.mockResolvedValue(mockSurvey);

      const result = await surveyService.getSurveyResponseByQuestions(
        mockSurveyId,
      );

      expect(result).toEqual({
        survey: mockSurvey,
        message: 'Survei tidak memiliki respon',
      });
    });

    it('should throw BadRequestException if the ID is not a valid UUID', async () => {
      const invalidId = '123';
      await expect(
        surveyService.getSurveyResponseByQuestions(invalidId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the survey does not exist', async () => {
      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(
        surveyService.getSurveyResponseByQuestions(mockSurveyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a NotFoundException if the survey has no questions', async () => {
      const mockSurveyWithNoQuestions = {
        id: mockSurveyId,
        type: FormType.CURRICULUM,
        title: 'Survey Test',
        description: 'deskripsi',
        startTime: new Date(2024, 0, 1),
        endTime: new Date(2024, 1, 1),
        admissionYearFrom: 2020,
        admissionYearTo: 2024,
        graduateYearFrom: 2024,
        graduateYearTo: 2028,
        questions: [],
      };

      prismaMock.form.findUnique.mockResolvedValue(mockSurveyWithNoQuestions);

      await expect(
        surveyService.getSurveyResponseByQuestions(mockSurveyId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        surveyService.getSurveyResponseByQuestions(mockSurveyId),
      ).rejects.toThrow('Survei belum memiliki pertanyaan');
    });
  });

  describe('analyze response data', () => {
    const mockSurvey = {
      title: 'Survey Test',
      questions: [
        {
          question: 'Seberapa baik situs kami?',
          type: 'RANGE',
          options: [
            { label: '1', answers: [] },
            { label: '2', answers: [] },
            { label: '3', answers: [{ answer: '3' }] },
            { label: '4', answers: [{ answer: '4' }] },
            { label: '5', answers: [{ answer: '5' }] },
          ],
          answers: [{ answer: '4' }, { answer: '5' }, { answer: '3' }],
        },
        {
          question: 'Fitur mana yang Anda gunakan?',
          type: 'CHECKBOX',
          options: [
            {
              label: 'Obrolan',
              answers: [{ answer: 'Obrolan' }, { answer: 'Obrolan' }],
            },
            {
              label: 'Pencarian',
              answers: [{ answer: 'Pencarian' }, { answer: 'Pencarian' }],
            },
          ],
          answers: [
            { answer: 'Obrolan' },
            { answer: 'Obrolan' },
            { answer: 'Pencarian' },
            { answer: 'Pencarian' },
          ],
        },
        {
          question: 'Apakah Anda akan merekomendasikan kami?',
          type: 'RADIO',
          options: [
            { label: 'Ya', answers: [{ answer: 'Ya' }, { answer: 'Ya' }] },
            { label: 'Tidak', answers: [{ answer: 'Tidak' }] },
          ],
          answers: [{ answer: 'Ya' }, { answer: 'Ya' }, { answer: 'Tidak' }],
        },
        {
          question: 'Saran Anda?',
          type: 'TEXT',
          options: [],
          answers: [
            { answer: 'Tambah artikel.' },
            { answer: 'Perbaiki kecepatan.' },
            { answer: 'Semuanya baik.' },
          ],
        },
      ],
    };

    const totalRespondents = 3;

    it('should correctly analyze range type questions', async () => {
      const stats = await surveyService.analyzeResponse(
        mockSurvey,
        totalRespondents,
      );
      expect(stats[0].data).toEqual([
        { optionLabel: '1', optionAnswersCount: 0, percentage: '0.00%' },
        { optionLabel: '2', optionAnswersCount: 0, percentage: '0.00%' },
        { optionLabel: '3', optionAnswersCount: 1, percentage: '33.33%' },
        { optionLabel: '4', optionAnswersCount: 1, percentage: '33.33%' },
        { optionLabel: '5', optionAnswersCount: 1, percentage: '33.33%' },
      ]);
    });

    it('should correctly analyze checkbox type questions', async () => {
      const stats = await surveyService.analyzeResponse(
        mockSurvey,
        totalRespondents,
      );
      expect(stats[1].data).toEqual([
        {
          optionLabel: 'Obrolan',
          optionAnswersCount: 2,
          percentage: '66.67%',
        },
        {
          optionLabel: 'Pencarian',
          optionAnswersCount: 2,
          percentage: '66.67%',
        },
      ]);
    });

    it('should correctly analyze radio type questions', async () => {
      const stats = await surveyService.analyzeResponse(
        mockSurvey,
        totalRespondents,
      );
      expect(stats[2].data).toEqual([
        {
          optionLabel: 'Ya',
          optionAnswersCount: 2,
          percentage: '66.67%',
        },
        {
          optionLabel: 'Tidak',
          optionAnswersCount: 1,
          percentage: '33.33%',
        },
      ]);
    });

    it('should correctly analyze text type questions', async () => {
      const stats = await surveyService.analyzeResponse(
        mockSurvey,
        totalRespondents,
      );
      expect(stats[3].data).toEqual([
        'Tambah artikel.',
        'Perbaiki kecepatan.',
        'Semuanya baik.',
      ]);
    });
  });

  describe('getSurveyResponseByAlumni', () => {
    it('should return survey responses including alumni and answers', async () => {
      const mockSurveyId = '65259cd0-b2e2-4ac0-9dd2-847dbd79157b';
      const mockResponseId1 = '1ea1c841-f238-4619-914c-d8b3afe6d47c';
      const mockQuestionId1 = '14a4acdc-50b1-477f-90e9-8e0c99e85e58';
      const mockResponseId2 = '2ea1c841-f238-4619-914c-d8b3afe6d47c';
      const mockQuestionId2 = '24a4acdc-50b1-477f-90e9-8e0c99e85e58';

      const mockUser: User = {
        id: 'use02c84-f321-4b4e-bff6-780c8cae17b3',
        name: 'John',
        email: 'john@example.com',
        password:
          '$2b$10$89KoyS3YtlCfSsfHiyZTN.HZjngo8VPgztWWHQHkM0A7JqpMuDWgm|b7adb2299b170577|b3b6620444be4ad38531d3eaae8924a4|5a015347e1321163988c75132dfbea5d',
        role: Role.ALUMNI,
      };

      const mockStudyProgram: StudyProgram = {
        id: 'std02c84-f321-4b4e-bff6-780c8cae17b3',
        name: 'Computer Science',
        code: '123',
        level: StudyProgramLevel.D3,
      };

      const mockAlumni: Alumni & { user: User } & {
        studyProgram: StudyProgram;
      } = {
        id: 'b6e02c84-f321-4b4e-bff6-780c8cae17b3',
        phoneNo:
          '$2b$10$89KoyS3YtlCfSsfHiyZTN.HZjngo8VPgztWWHQHkM0A7JqpMuDWgm|b7adb2299b170577|b3b6620444be4ad38531d3eaae8924a4|5a015347e1321163988c75132dfbea5d',
        address:
          '$2b$10$89KoyS3YtlCfSsfHiyZTN.uBMnQX2lluICrEGO9kCMCrTk0NFlEDS|cd4f8f6c4b718dd5|5cad4e104c5c6f639d47a668bed256a2|7ac79c3c1744857d5cdbf1d948db5fbad37f01d68fba6bacb5cb50b409d29333',
        gender: 'FEMALE',
        enrollmentYear: 2021,
        graduateYear: 2024,
        studyProgramId: '393f6a47-425e-4402-92b6-782d266e0193',
        npm: '2106634331',
        user: mockUser,
        studyProgram: mockStudyProgram,
      };

      const mockResponse1: Response & { alumni: Alumni } = {
        id: mockResponseId1,
        formId: mockSurveyId,
        alumniId: mockAlumni.id,
        alumni: mockAlumni,
      };

      const mockAnswer1: Answer & { response: Response } = {
        id: 'e1c3b99e-576b-4b81-976f-a949797de075',
        answer: 'John',
        responseId: mockResponseId1,
        questionId: mockQuestionId1,
        response: mockResponse1,
      };

      const mockAnswer2: Answer & { response: Response } = {
        id: 'e2c3b99e-576b-4b81-976f-a949797de075',
        answer: 'Python',
        responseId: mockResponseId2,
        questionId: mockQuestionId2,
        response: mockResponse1,
      };

      const mockQuestion1: Question & { answers: Answer[] } = {
        id: mockQuestionId1,
        type: QuestionType.TEXT,
        question: 'What is your name?',
        rangeFrom: null,
        rangeTo: null,
        order: 1,
        formId: mockSurveyId,
        answers: [mockAnswer1],
      };

      const mockQuestion2: Question & { answers: Answer[] } = {
        id: mockQuestionId2,
        type: QuestionType.TEXT,
        question: 'What is your favorite programming language?',
        rangeFrom: null,
        rangeTo: null,
        order: 2,
        formId: mockSurveyId,
        answers: [mockAnswer2],
      };

      const mockSurvey: Form & { questions: Question[] } = {
        id: mockSurveyId,
        type: FormType.CURRICULUM,
        title: 'Survey buat semua alumni',
        description: 'Survey Description',
        startTime: new Date('2024-03-24T17:00:00.000Z'),
        endTime: new Date('2024-04-24T20:15:00.000Z'),
        admissionYearFrom: null,
        admissionYearTo: null,
        graduateYearFrom: null,
        graduateYearTo: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      prismaMock.form.findUnique.mockResolvedValue(mockSurvey);
      const result = await surveyService.getSurveyResponseByAlumni(
        mockSurveyId,
      );

      expect(result.alumniResponse).toBeDefined();
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      const invalidId = 'invalid-id';

      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(
        surveyService.getSurveyResponseByAlumni(invalidId),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw NotFoundException if survey is not found', async () => {
      const surveyId = 'e1c3b99e-576b-4b81-911f-a949797de075';

      prismaMock.form.findUnique.mockResolvedValue(null);

      await expect(
        surveyService.getSurveyResponseByAlumni(surveyId),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
