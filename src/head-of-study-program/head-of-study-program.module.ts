import { Module } from '@nestjs/common';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { HeadOfStudyProgramController } from './head-of-study-program.controller';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';

@Module({
  imports: [ZxcvbnModule],
  controllers: [HeadOfStudyProgramController],
  providers: [HeadOfStudyProgramService],
})
export class HeadOfStudyProgramModule {}
