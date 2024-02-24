import { IsNotEmpty, IsString } from 'class-validator';

export class StudyProgramDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}
