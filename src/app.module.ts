import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudyProgramModule } from './studyProgram/studyProgram.module';
import { ProfileModule } from './profile/profile.module';
import { HeadOfStudyProgramModule } from './head-of-study-program/head-of-study-program.module';
import { ZxcvbnModule } from './zxcvbn/zxcvbn.module';
import { SurveyModule } from './survey/survey.module';
import { NotificationModule } from './notification/notification.module';
import { AlumniListModule } from './alumni-list/alumni-list.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    StudyProgramModule,
    ProfileModule,
    HeadOfStudyProgramModule,
    ZxcvbnModule,
    SurveyModule,
    NotificationModule,
    AlumniListModule,
    MailModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAILING_EMAIL,
          pass: process.env.MAILING_PASS,
        },
      },
      template: {
        dir:
          process.env.NODE_ENV === 'production'
            ? '/dist/mail/templates/'
            : process.cwd() + '/src/mail/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
