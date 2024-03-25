import { FormType, QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class OptionDTO {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  order: number;
}

export class QuestionDTO {
  @IsString()
  @IsIn(['TEXT', 'CHECKBOX', 'RADIO', 'RANGE'])
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsNumber()
  order: number;

  @IsNumber()
  @IsOptional()
  rangeFrom?: number;

  @IsNumber()
  @IsOptional()
  rangeTo?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDTO)
  @IsOptional()
  options?: OptionDTO[];
}

export class ExistingQuestionDTO extends QuestionDTO {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class DeleteQuestionDTO {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class SurveyDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn(['CURRICULUM', 'CAREER'])
  type: FormType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endTime: Date;

  @IsNumber()
  @IsOptional()
  admissionYearFrom?: number;

  @IsNumber()
  @IsOptional()
  admissionYearTo?: number;

  @IsNumber()
  @IsOptional()
  graduateYearFrom?: number;

  @IsNumber()
  @IsOptional()
  graduateYearTo?: number;
}
export class CreateSurveyDTO extends SurveyDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions: QuestionDTO[];
}
export class EditSurveyDTO extends SurveyDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  newQuestions: QuestionDTO[];

  @IsArray()
  deleteQuestions: DeleteQuestionDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExistingQuestionDTO)
  updateQuestions: ExistingQuestionDTO[];
}
