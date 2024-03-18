import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSurveyDTO } from './DTO/CreateSurveyDTO';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async createSurvey(createSurveyDTO: CreateSurveyDTO) {
    throw new Error('Unimplemented Function');
  }
}
