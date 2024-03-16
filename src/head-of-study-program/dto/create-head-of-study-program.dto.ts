import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

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

  @IsNotEmpty()
  @MaxLength(10)
  @IsNumberString()
  nip: string;
}
