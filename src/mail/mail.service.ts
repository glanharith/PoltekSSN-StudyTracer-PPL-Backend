import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SurveyMailContext } from './mail.interface';
import * as Sentry from '@sentry/node';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendSurveyStartMail(to: string, mailContext: SurveyMailContext) {
    try {
      await this.mailerService.sendMail({
        to,
        from: process.env.MAILING_EMAIL,
        subject: 'Survey Dimulai',
        template: 'survey',
        context: mailContext,
      });
    } catch (e) {
      Sentry.captureException(e);
    }
  }
}
