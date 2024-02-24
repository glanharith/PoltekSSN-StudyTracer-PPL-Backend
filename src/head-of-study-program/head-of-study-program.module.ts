import { Module } from '@nestjs/common';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { HeadOfStudyProgramController } from './head-of-study-program.controller';

@Module({
  controllers: [HeadOfStudyProgramController],
  providers: [HeadOfStudyProgramService]
})
export class HeadOfStudyProgramModule {}
