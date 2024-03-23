import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSurveyDTO,
  EditSurveyDTO,
  QuestionDTO,
  SurveyDTO,
} from './DTO/SurveyDTO';

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

  async editSurvey(id: string, editSurveyDTO: EditSurveyDTO) {
    const { newQuestions, updateQuestions, deleteQuestions, ...form } =
      editSurveyDTO;

    this.validateFormDetails(form);

    this.validateQuestions([...newQuestions, ...updateQuestions]);

    await this.prisma.$transaction(async (tx) => {
      await tx.form.update({
        where: {
          id: id,
        },
        data: {
          ...form,
        },
      });

      const existingQuestions = await tx.question.findMany({
        select: {
          id: true,
        },
        where: {
          formId: id,
        },
      });

      const existingQuestionIdSet = new Set(existingQuestions.map((q) => q.id));

      [...updateQuestions, ...deleteQuestions].forEach((q) => {
        if (!existingQuestionIdSet.has(q.id!!)) {
          throw new BadRequestException({
            message: 'Failed to update or delete question: Question not found',
          });
        }
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

      for (const q of deleteQuestions) {
        await tx.question.delete({
          where: {
            id: q.id,
          },
        });
      }
    });
  }
}
