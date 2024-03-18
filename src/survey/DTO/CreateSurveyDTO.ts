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
  ValidateNested,
} from 'class-validator';

export class OptionDTO {
  @IsString()
  @IsNotEmpty()
  label: string;
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

export class CreateSurveyDTO {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions: QuestionDTO[];
}
