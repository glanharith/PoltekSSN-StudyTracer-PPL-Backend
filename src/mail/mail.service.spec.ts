import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SurveyMailContext } from './mail.interface';
import * as Sentry from '@sentry/node';

jest.mock('@sentry/node');

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<jest.Mocked<MailerService>>(MailerService);
  });

  it('should send survey start mail', async () => {
    const to = 'test@gmail.com';
    const mailContext: SurveyMailContext = {
      name: 'User',
      surveyName: 'Test Survey',
      surveyLink: 'https://google.com',
      endDate: new Date().toLocaleString(),
    };

    await mailService.sendSurveyStartMail(to, mailContext);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to,
      from: process.env.MAILING_EMAIL,
      subject: 'Survey Dimulai',
      template: 'survey',
      context: mailContext,
    });
  });

  it('should capture exception with Sentry on error', async () => {
    const to = 'test@gmail.com';
    const mailContext: SurveyMailContext = {
      name: 'User',
      surveyName: 'Test Survey',
      surveyLink: 'https://google.com',
      endDate: new Date().toLocaleString(),
    };
    const error = new Error('Test error');

    mailerService.sendMail.mockRejectedValue(error);

    await mailService.sendSurveyStartMail(to, mailContext);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
