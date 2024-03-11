import { StudyProgramLevel } from '@prisma/client';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StudyProgramDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsIn(['D3', 'D4'])
  @IsNotEmpty()
  level: StudyProgramLevel;
}
