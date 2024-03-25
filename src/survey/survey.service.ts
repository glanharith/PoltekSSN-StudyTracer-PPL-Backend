import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';
import { FormType } from '@prisma/client';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async createSurvey(createSurveyDTO: CreateSurveyDTO) {
    const { questions, ...form } = createSurveyDTO;
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

    const questionOrderSet = new Set();
    questions.forEach((q) => {
      const { type, rangeFrom, rangeTo, options, order } = q;

      if (questionOrderSet.has(order)) {
        throw new BadRequestException({
          message: 'Question order must be unique within a form',
        });
      }

      questionOrderSet.add(order);

      if (type === 'CHECKBOX' || type === 'RADIO') {
        if (options === undefined || options.length === 0) {
          throw new BadRequestException({
            message:
              'Question with type CHECKBOX or RADIO must have at least 1 options',
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
        if (rangeFrom === undefined || rangeTo === undefined) {
          throw new BadRequestException({
            message: 'Question with type RANGE must have rangeFrom and rangeTo',
          });
        }

        if (rangeFrom > rangeTo) {
          throw new BadRequestException({
            message:
              'Question with type RANGE must have rangeFrom less than or equal rangeTo',
          });
        }
      }
    });

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

  async getAllAvailableAlumniSurvey(surveyType: string) {
    const now = new Date();
    return this.prisma.form.findMany({
      where: {
        type:
          surveyType == 'CURRICULUM' ? FormType.CURRICULUM : FormType.CAREER,
        startTime: {
          lte: now,
        },
        endTime: {
          gt: now,
        },
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
      },
    });
  }
}
