import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { unsecure } from 'src/common/util/security';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateFormActivityStatus() {
    this.logger.log('Updating form activity status');
    const now = new Date();

    const startedSurvey = await this.prisma.form.findMany({
      where: {
        isActive: false,
        startTime: { lte: now },
        endTime: { gte: now },
        lastUpdate: null,
      },
    });

    const allAlumni = await this.prisma.user.findMany({
      where: {
        role: 'ALUMNI',
      },
    });

    const promises = startedSurvey.flatMap((survey) =>
      allAlumni.map(async (alumnus) => {
        const email = await unsecure(alumnus.email);

        await this.mailService.sendSurveyStartMail(email, {
          name: alumnus.name,
          surveyName: survey.title,
          surveyLink: `${process.env.APP_ALLOWED_ORIGIN}/survey/${survey.id}`,
          endDate: survey.endTime.toLocaleString(),
        });
      }),
    );

    await this.prisma.form.updateMany({
      where: {
        isActive: false,
        startTime: { lte: now },
        endTime: { gte: now },
        lastUpdate: null,
      },
      data: { isActive: true },
    });

    const formsToDeactivate = await this.prisma.form.findMany({
      where: {
        isActive: true,
        endTime: { lt: now },
      },
    });

    if (Array.isArray(formsToDeactivate)) {
      for (const form of formsToDeactivate) {
        if (!form.lastUpdate || form.lastUpdate < form.endTime) {
          await this.prisma.form.update({
            where: { id: form.id },
            data: { isActive: false },
          });
        }
      }
    }

    // wait all email to be sent
    await Promise.all(promises);
  }
}
