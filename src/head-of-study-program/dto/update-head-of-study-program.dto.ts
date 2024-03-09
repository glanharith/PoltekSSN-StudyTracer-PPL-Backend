import { MinLength, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateHeadOfStudyProgramDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  name?: string;

  @IsOptional()
  @IsUUID()
  studyProgramId?: string;
}
