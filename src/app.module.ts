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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
