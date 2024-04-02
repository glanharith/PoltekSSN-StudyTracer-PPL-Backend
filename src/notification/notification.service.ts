import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotification(userEmail: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const allSurvey = await this.prisma.form.findMany();
    const userResponse = await this.prisma.response.findMany({
      where: {
        alumniId: user?.id,
      },
      select: {
        formId: true,
      },
    });
    const filledSurveyIds = userResponse.map((response) => response.formId);
    const filledSurvey = allSurvey.filter((survey) =>
      filledSurveyIds.includes(survey.id),
    );
    const unfilledSurvey = allSurvey.filter(
      (survey) => !filledSurveyIds.includes(survey.id),
    );

    const notification = unfilledSurvey.map((survey) => {
      return {
        surveyId: survey.id,
        message: `Anda memiliki survei "${survey.title}" yang belum diisi.`,
      };
    });
    return {
      filledSurveys: filledSurvey,
      unfilledSurveys: unfilledSurvey,
      notifications: notification,
    };
  }
}
