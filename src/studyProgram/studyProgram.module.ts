import { Module } from '@nestjs/common';
import { StudyProgramService } from './studyProgram.service';
import { StudyProgramController } from './studyProgram.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StudyProgramController],
  providers: [StudyProgramService, PrismaService],
})
export class StudyProgramModule {}
