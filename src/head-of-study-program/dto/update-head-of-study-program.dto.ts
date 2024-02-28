import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHeadOfStudyProgramDto {
  @IsNotEmpty()
  @IsString()
  studyProgramId: string;
}
