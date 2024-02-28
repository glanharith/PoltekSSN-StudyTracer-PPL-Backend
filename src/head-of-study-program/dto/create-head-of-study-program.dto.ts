import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHeadOfStudyProgramDto {
  @IsNotEmpty()
  @IsString()
  studyProgramId: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
