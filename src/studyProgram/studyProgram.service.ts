import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudyProgram } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyProgramService {
  constructor(private readonly prisma: PrismaService) {}
  async create(studyProgramName: string): Promise<StudyProgram> {
    if (await this.isStudyProgramNameAvailable(studyProgramName)) {
      const newStudyProgram = await this.prisma.studyProgram.create({
        data: {
          name: studyProgramName,
        },
      });
      return newStudyProgram;
    }
    throw new ConflictException('Study program name already exists');
  }

  async update(id: string, name: string): Promise<StudyProgram> {
    await this.getStudyProgramById(id);
    if (await this.isStudyProgramNameAvailable(name)) {
      const updatedStudyProgram = await this.prisma.studyProgram.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });
      return updatedStudyProgram;
    }
    throw new ConflictException('Study program name already exists');
  }

  async getStudyProgramById(id: string): Promise<StudyProgram> {
    const studyProgram = await this.prisma.studyProgram.findUnique({
      where: {
        id,
      },
    });

    if (!studyProgram) throw new NotFoundException('Study program not found');
    return studyProgram;
  }

  async isStudyProgramNameAvailable(name: string): Promise<boolean> {
    const count = await this.prisma.studyProgram.count({
      where: {
        name: name,
      },
    });

    return count === 0;
  }

  async findAll(): Promise<StudyProgram[]> {
    throw new Error('Method not implemented.');
  }
}
