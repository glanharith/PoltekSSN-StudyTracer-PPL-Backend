import { IsString } from 'class-validator';
export class UpdateHeadOfStudyProgramDto {
  @IsString()
  studyProgramId: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
