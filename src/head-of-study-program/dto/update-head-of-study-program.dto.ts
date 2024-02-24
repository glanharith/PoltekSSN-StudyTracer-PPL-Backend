import { PartialType } from '@nestjs/mapped-types';
import { CreateHeadOfStudyProgramDto } from './create-head-of-study-program.dto';

export class UpdateHeadOfStudyProgramDto extends PartialType(CreateHeadOfStudyProgramDto) {}
