import { Gender, Role } from '@prisma/client';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterDTO {
  // All role
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIn(['ALUMNI', 'ADMIN', 'HEAD_STUDY_PROGRAM'])
  @IsNotEmpty()
  role: Role;

  // Alumni only
  @IsString()
  @IsOptional()
  phoneNo: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsIn(['MALE', 'FEMALE'])
  @IsOptional()
  gender: Gender;

  @IsNumber()
  @IsOptional()
  enrollmentYear: number;

  @IsNumber()
  @IsOptional()
  graduateYear: number;

  // Alumni and Head
  @IsString()
  @IsOptional()
  studyProgramId: string;
}
