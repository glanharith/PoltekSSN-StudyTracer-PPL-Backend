import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSurveyDTO,
  EditSurveyDTO,
  QuestionDTO,
  SurveyDTO,
} from './DTO/SurveyDTO';
import { isUUID } from 'class-validator';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  private validateFormDetails(form: SurveyDTO) {
    const {
      startTime,
      endTime,
      admissionYearFrom,
      admissionYearTo,
      graduateYearFrom,
      graduateYearTo,
    } = form;

    if (startTime.getTime() >= endTime.getTime()) {
      throw new BadRequestException({
        message: 'startTime must be before endTime',
      });
    }

    if (
      admissionYearFrom &&
      admissionYearTo &&
      admissionYearFrom > admissionYearTo
    ) {
      throw new BadRequestException({
        message: 'admissionYearFrom must be before admissionYearTo',
      });
    }

    if (
      graduateYearFrom &&
      graduateYearTo &&
      graduateYearFrom > graduateYearTo
    ) {
      throw new BadRequestException({
        message: 'graduateYearFrom must be before graduateYearTo',
      });
    }
  }

  private validateQuestions(questions: QuestionDTO[]) {
    const questionOrderSet = new Set();

    questions.forEach((q) => {
      const { type, rangeFrom, rangeTo, options, order } = q;

      if (questionOrderSet.has(order)) {
        throw new BadRequestException({
          message: 'Question order must be unique within a form',
        });
      }

      questionOrderSet.add(order);

      if (['CHECKBOX', 'RADIO'].includes(type)) {
        if (options === undefined || options.length === 0) {
          throw new BadRequestException({
            message:
              'Question with type CHECKBOX or RADIO must have at least 1 option',
          });
        }

        const optionOrderSet = new Set();
        options.forEach(({ order }) => {
          if (optionOrderSet.has(order)) {
            throw new BadRequestException({
              message: 'Option order must be unique within a question',
            });
          }
          optionOrderSet.add(order);
        });
      }

      if (type === 'RANGE') {
        if (
          rangeFrom === undefined ||
          rangeTo === undefined ||
          rangeFrom > rangeTo
        ) {
          throw new BadRequestException({
            message:
              'Question with type RANGE must have rangeFrom and rangeTo, with rangeFrom less than or equal to rangeTo',
          });
        }
      }
    });
  }

  async createSurvey(createSurveyDTO: CreateSurveyDTO) {
    const { questions, ...form } = createSurveyDTO;

    this.validateFormDetails(form);

    this.validateQuestions(questions);

    await this.prisma.$transaction(async (tx) => {
      const { id } = await tx.form.create({
        data: {
          ...form,
        },
      });

      for (const q of questions) {
        const { options, ...question } = q;
        await tx.question.create({
          data: {
            ...question,
            formId: id,
            option: {
              createMany: {
                data: options ?? [],
              },
            },
          },
        });
      }
    });
  }

<<<<<<< HEAD
  async getSurveyById(surveyId: string) {
    return this.prisma.form.findUnique({
      where: {
        id: surveyId,
      },
=======
  async editSurvey(id: string, editSurveyDTO: EditSurveyDTO) {
    const { newQuestions, updateQuestions, deleteQuestions, ...form } =
      editSurveyDTO;

    this.validateFormDetails(form);

    this.validateQuestions([...newQuestions, ...updateQuestions]);

    const existingQuestions = await this.prisma.question.findMany({
      select: {
        id: true,
      },
      where: {
        formId: id,
      },
    });

    const existingQuestionIdSet = new Set(existingQuestions.map((q) => q.id));
    const updateQuestionIds = updateQuestions.map((q) => q.id);
    const deleteQuestionIds = deleteQuestions.map((q) => q.id);

    [...updateQuestionIds, ...deleteQuestionIds].forEach((q) => {
      if (!existingQuestionIdSet.has(q)) {
        throw new BadRequestException({
          message: 'Failed to update or delete question: Question not found',
        });
      }
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.form.update({
        where: {
          id: id,
        },
        data: {
          ...form,
        },
      });

      for (const q of newQuestions) {
        const { options, ...question } = q;
        await tx.question.create({
          data: {
            ...question,
            formId: id,
            option: {
              createMany: {
                data: options ?? [],
              },
            },
          },
        });
      }

      for (const q of updateQuestions) {
        const { options, ...question } = q;
        await tx.question.update({
          where: {
            id: q.id,
          },
          data: {
            ...question,
            formId: id,
            option: {
              createMany: {
                data: options ?? [],
              },
            },
          },
        });
      }

      await tx.question.deleteMany({
        where: {
          id: {
            in: deleteQuestionIds,
          },
        },
      });
    });
  }

  async deleteSurvey(id: string): Promise<string> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Invalid ID format. ID must be a valid UUID',
      );
    }

    const survey = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    const startTime = survey.startTime.getTime();
    const endTime = survey.endTime.getTime();
    const currentTime = new Date().getTime();

    if (currentTime >= startTime && currentTime <= endTime) {
      throw new BadRequestException(
        'Cannot delete survey during its active period',
      );
    }

    await this.prisma.form.delete({
      where: { id },
    });

    return id;
  }

  async getSurvey(id: string): Promise<Record<string, any>> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Invalid ID format. ID must be a valid UUID',
      );
    }

    const survey = await this.prisma.form.findUnique({
      where: { id },
>>>>>>> daefe71d59316e2a603ad51251767102d46ca3b8
      include: {
        questions: {
          include: {
            option: true,
          },
        },
      },
    });
<<<<<<< HEAD
=======

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
>>>>>>> daefe71d59316e2a603ad51251767102d46ca3b8
  }
}
