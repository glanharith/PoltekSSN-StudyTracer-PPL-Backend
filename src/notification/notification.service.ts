import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotification(userEmail: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select:{
        id: true,
        alumni:{
          select:{
            graduateYear: true,
            enrollmentYear: true,
          }
        }
      }
    });
    
    const currentDate = new Date();

    const activeSurveys = await this.prisma.form.findMany({
      where: {
        startTime: { lte: currentDate },
        endTime: { gte: currentDate },
      },
    });
    const eligibleForms = activeSurveys.filter((form) => {
      if (!user) throw new NotFoundException('User not found');
      if (!user.alumni) throw new NotFoundException('User not found');
      return(
        (!form.admissionYearFrom || (user.alumni.enrollmentYear >= form.admissionYearFrom)) &&
        (!form.admissionYearTo || (user.alumni.enrollmentYear <= form.admissionYearTo)) &&
        (!form.graduateYearFrom || (user.alumni.graduateYear >= form.graduateYearFrom)) &&
        (!form.graduateYearTo || (user.alumni.graduateYear <= form.graduateYearTo))
      )
        
    });
    const userResponse = await this.prisma.response.findMany({
      where: {
        alumniId: user?.id,
        formId: { in: eligibleForms.map((form) => form.id) },
      },
      select: {
        formId: true,
      },
    });
    const filledFormIds = userResponse.map((response) => response.formId);
    const filledSurvey = eligibleForms.filter((form) =>
      filledFormIds.includes(form.id),
    );
    const unfilledSurvey = eligibleForms.filter(
      (form) =>

        !filledFormIds.includes(form.id)
        
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
