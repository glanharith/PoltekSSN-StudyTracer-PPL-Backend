import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HeadStudyProgram, StudyProgram } from '@prisma/client';
import { hash, secure, unsecure } from 'src/common/util/security';
import { UpdateHeadOfStudyProgramDto } from './dto/update-head-of-study-program.dto';

@Injectable()
export class HeadOfStudyProgramService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    email,
    name,
    password,
    studyProgramId,
  }: CreateHeadOfStudyProgramDto) {
    const emailHash = await hash(email);

    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          startsWith: `${emailHash}|`,
        },
      },
    });

    if (user) {
      throw new BadRequestException({
        message: 'User with given email already exists',
      });
    }

    const studyProgram = await this.prisma.studyProgram.findUnique({
      where: {
        id: studyProgramId,
      },
    });

    if (!studyProgram) {
      throw new BadRequestException({
        message: 'Invalid study program',
      });
    }

    const securedEmail = await secure(email);
    const hashedPassword = await hash(password);

    const userRegist = await this.prisma.user.create({
      data: {
        email: securedEmail,
        name,
        password: hashedPassword,
        role: 'HEAD_STUDY_PROGRAM',
        headStudyProgram: {
          create: {
            studyProgramId,
          },
        },
      },
    });

    return userRegist;
  }

  async findAll() {
    const res = await this.prisma.user.findMany({
      where: {
        role: 'HEAD_STUDY_PROGRAM',
      },
      select: {
        id: true,
        name: true,
        email: true,
        headStudyProgram: {
          select: {
            studyProgram: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (res.length == 0) return [];

    const modifiedData = await res.map(async ({ email, ...rest }) => ({
      ...rest,
      email: await unsecure(email),
    }));

    const cleanData = await Promise.all(modifiedData);
    return cleanData;
  }

  async getHeadById(id: string): Promise<HeadStudyProgram> {
    const existingHeadOfStudyProgram = await this.prisma.headStudyProgram.findUnique({
      where: { id },
    });

    if (!existingHeadOfStudyProgram) {
      throw new NotFoundException(`Head of Study Program with ID ${id} not found`);
    }
    else {
      return existingHeadOfStudyProgram;
    };
  }

  async getManyHeadByIds(ids: string[]): Promise<HeadStudyProgram[]> {
    const existingHeadOfStudyPrograms = await this.prisma.headStudyProgram.findMany({
      where: { id: { in: ids } },
    });

    if (existingHeadOfStudyPrograms.length !== ids.length) {
      throw new NotFoundException('Head of Study Program not all found');
    }
    else {
      return existingHeadOfStudyPrograms;
    };
  }

  async getStudyProgramById(id :string): Promise<StudyProgram> {
    const existingStudyProgram = await this.prisma.studyProgram.findUnique({
      where: { id },
    });
  
    if (!existingStudyProgram) {
      throw new NotFoundException(`Study Program with ID ${id} not found`);
    }
    else {
      return existingStudyProgram;
    };
  }

  async isStudyProgramAvailable(studyProgramId: string): Promise<boolean> {
    const count = await this.prisma.headStudyProgram.count({
      where: { studyProgramId: studyProgramId },
    });

    const isAvailable = count === 0;
    if (!isAvailable) {
      throw new BadRequestException(`Study Program with ID ${studyProgramId} is not available`)
    }
    else {
      return isAvailable
    };
  }

  async deleteMultiple(ids: string[]): Promise<{ ids: string[]; message: string }> {
    await this.getManyHeadByIds(ids)

    await this.prisma.headStudyProgram.deleteMany({
      where: { id: { in: ids } },
    });

    return { ids, message: 'Deleted successfully' };
  }
  
  async delete(id: string): Promise<{id: string; message: string}> {
    await this.getHeadById(id);

    await this.prisma.headStudyProgram.delete({
      where: { id },
    });

    return { id, message: "Deleted successfully" };
  }

  async update(id: string, { studyProgramId: studyProgramId }: UpdateHeadOfStudyProgramDto): Promise<{id: string; studyProgramId: string; message: string}> {
    await this.getHeadById(id);

    await this.getStudyProgramById(id);

    await this.isStudyProgramAvailable(studyProgramId);
  
    await this.prisma.headStudyProgram.update({
      where: { id },
      data: { studyProgramId },
    });
  
    return { id, studyProgramId, message: "Updated successfully" };
  }
}
