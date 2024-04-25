import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudyProgram } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StudyProgramDTO } from './DTO';

@Injectable()
export class StudyProgramService {
  constructor(private readonly prisma: PrismaService) {}
  async create({ name, code, level }: StudyProgramDTO): Promise<StudyProgram> {
    if (await this.isStudyProgramNameAvailable('', name)) {
      return await this.prisma.studyProgram.create({
        data: {
          name: name,
          code: code,
          level: level,
        },
      });
    }
    throw new ConflictException('Study program name already exists');
  }

  async update(
    id: string,
    { name, code, level }: StudyProgramDTO,
  ): Promise<StudyProgram> {
    await this.getStudyProgramById(id);
    if (await this.isStudyProgramNameAvailable(id, name)) {
      return await this.prisma.studyProgram.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          code: code,
          level: level,
        },
      });
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

  async isStudyProgramNameAvailable(id: string, name: string) {
    const count = await this.prisma.studyProgram.count({
      where: {
        name: name,
        NOT: { id: id },
      },
    });

    return count === 0;
  }

  async findAll(): Promise<StudyProgram[]> {
    return this.prisma.studyProgram.findMany({});
  }

  async delete(id: string): Promise<StudyProgram> {
    await this.getStudyProgramById(id);
    await this.checkStudyProgramsUsed([id]);
    return await this.prisma.studyProgram.delete({
      where: {
        id: id,
      },
    });
  }

  async getMultipleStudyProgramsById(ids: string[]): Promise<StudyProgram[]> {
    const studyPrograms = await this.prisma.studyProgram.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (studyPrograms.length != ids.length) {
      throw new NotFoundException('Study program not found');
    }
    return studyPrograms;
  }

  async deleteMultiple(ids: string[]): Promise<StudyProgram[]> {
    const studyPrograms = await this.getMultipleStudyProgramsById(ids);
    await this.checkStudyProgramsUsed(ids);
    await this.prisma.studyProgram.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return studyPrograms;
  }

  async hasHeadStudyProgram(studyProgramId: string): Promise<boolean> {
    await this.getStudyProgramById(studyProgramId);
    const studyProgram = await this.prisma.studyProgram.findUnique({
      where: { id: studyProgramId },
      include: { headStudyProgram: true },
    });

    if (!studyProgram) {
      return false;
    }

    return studyProgram.headStudyProgram.length > 0;
  }

  async hasAlumni(studyProgramId: string): Promise<boolean> {
    await this.getStudyProgramById(studyProgramId);
    const studyProgram = await this.prisma.studyProgram.findUnique({
      where: { id: studyProgramId },
      include: { alumni: true },
    });

    if (!studyProgram) {
      return false;
    }

    return studyProgram.alumni.length > 0;
  }

  async isStudyProgramUsed(studyProgramId: string): Promise<boolean> {
    const hasHeadStudyProgram = await this.hasHeadStudyProgram(studyProgramId);
    const hasAlumni = await this.hasAlumni(studyProgramId);

    return hasHeadStudyProgram || hasAlumni;
  }

  async checkStudyProgramsUsed(
    studyProgramIds: string[],
  ): Promise<StudyProgram[]> {
    const usedStudyPrograms: StudyProgram[] = [];
    for (const studyProgramId of studyProgramIds) {
      const isUsed = await this.isStudyProgramUsed(studyProgramId);
      if (isUsed) {
        const studyProgram = await this.getStudyProgramById(studyProgramId);
        usedStudyPrograms.push(studyProgram);
      }
    }

    if (usedStudyPrograms.length !== 0) {
      const usedStudyProgramNames = usedStudyPrograms
        .map((studyProgram) => studyProgram.name)
        .join(', ');
      throw new ConflictException(
        `Program studi ${usedStudyProgramNames} terhubung dengan data kaprodi atau alumni`,
      );
    }

    return usedStudyPrograms;
  }
}
