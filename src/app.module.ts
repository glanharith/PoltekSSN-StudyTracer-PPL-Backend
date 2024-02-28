import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudyProgramModule } from './studyProgram/studyProgram.module';
<<<<<<< HEAD
import { ProfileModule } from './profile/profile.module';
=======
import { HeadOfStudyProgramModule } from './head-of-study-program/head-of-study-program.module';
>>>>>>> 4284ea96d8e8098843b4df8d0d56a98b763d0031

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    StudyProgramModule,
<<<<<<< HEAD
    ProfileModule,
=======
    HeadOfStudyProgramModule,
>>>>>>> 4284ea96d8e8098843b4df8d0d56a98b763d0031
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
