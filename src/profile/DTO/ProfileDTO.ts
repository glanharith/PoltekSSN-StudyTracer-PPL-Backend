import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProfileDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  phoneNo?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;
}
