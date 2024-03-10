import {
  MinLength,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class UpdateHeadOfStudyProgramDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  name?: string;

  @IsOptional()
  @IsUUID()
  studyProgramId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
