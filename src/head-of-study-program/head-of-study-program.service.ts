import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HeadStudyProgram, StudyProgram } from '@prisma/client';
import { hash, secure, unsecure } from 'src/common/util/security';
import { UpdateHeadOfStudyProgramDto } from './dto/update-head-of-study-program.dto';
import { isUUID } from 'class-validator';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';

@Injectable()
export class HeadOfStudyProgramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zxcvbnService: ZxcvbnService,
  ) {}

  async create({
    email,
    name,
    password,
    studyProgramId,
    nip,
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

    const head = await this.prisma.headStudyProgram.findFirst({
      where: {
        nip,
      },
    });

    if (head) {
      throw new BadRequestException({
        message: 'Head of study program with given nip already exists',
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

    const isAvailable = await this.prisma.headStudyProgram.count({
      where: {
        studyProgramId,
        isActive: true,
      },
    });

    if (isAvailable >= 1) {
      throw new BadRequestException({
        message: 'There is an existing head of study program',
      });
    }

    const passwordScore = await this.zxcvbnService.getScore(password);

    if (passwordScore <= 2) {
      throw new BadRequestException({
        message: 'Password not strong enough',
      });
    }

    const securedEmail = await secure(email);
    const hashedPassword = await hash(password);

    return await this.prisma.user.create({
      data: {
        email: securedEmail,
        name,
        password: hashedPassword,
        role: 'HEAD_STUDY_PROGRAM',
        headStudyProgram: {
          create: {
            studyProgramId,
            isActive: true,
            nip,
          },
        },
      },
    });
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
                id: true,
              },
            },
            isActive: true,
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

  // Get a head of study program by id
  async getHeadById(id: string): Promise<HeadStudyProgram> {
    // take from database
    const existingHeadOfStudyProgram =
      await this.prisma.headStudyProgram.findUnique({
        where: { id },
      });
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    // if not exist throw error, else return head
    if (!existingHeadOfStudyProgram) {
      throw new NotFoundException(
        `Head of Study Program with ID ${id} not found`,
      );
    } else if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    } else {
      return existingHeadOfStudyProgram;
    }
  }

  // Get head of study programs by ids
  async getManyHeadByIds(ids: string[]): Promise<HeadStudyProgram[]> {
    // take from database
    const existingHeadOfStudyPrograms =
      await this.prisma.headStudyProgram.findMany({
        where: { id: { in: ids } },
      });
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    // if not all exist throw error, else return heads
    if (existingHeadOfStudyPrograms.length !== ids.length) {
      throw new NotFoundException('Head of Study Program not all found');
    } else if (existingUsers.length !== ids.length) {
      throw new NotFoundException('User not all found');
    } else {
      return existingHeadOfStudyPrograms;
    }
  }

  // Get a study program by id
  async getStudyProgramById(id: string): Promise<StudyProgram> {
    // take from database
    const existingStudyProgram = await this.prisma.studyProgram.findUnique({
      where: { id },
    });

    // if not exist throw error, else return study program
    if (!existingStudyProgram) {
      throw new NotFoundException(`Study Program with ID ${id} not found`);
    } else {
      return existingStudyProgram;
    }
  }

  // Check availability of study program
  async isStudyProgramAvailable(id, studyProgramId: string): Promise<boolean> {
    // take from database
    const count = await this.prisma.headStudyProgram.count({
      where: {
        AND: [
          { studyProgramId: studyProgramId, isActive: true },
          { id: { not: id } }, // exclude the current id
        ],
      },
    });

    // boolean: study program isn't taken => true
    return count === 0;
  }

  // Delete multiple head of study program
  async deleteMultiple(
    ids: string[],
  ): Promise<{ ids: string[]; message: string }> {
    // check if each id is uuid
    ids.forEach((id) => {
      if (!isUUID(id)) {
        throw new BadRequestException(
          `Invalid ID format for ID ${id}. All IDs must be valid UUIDs.`,
        );
      }
    });

    // check if ids is in database
    await this.getManyHeadByIds(ids);

    // delete from databse
    await this.prisma.headStudyProgram.deleteMany({
      where: { id: { in: ids } },
    });
    await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });

    return { ids, message: 'Deleted successfully' };
  }

  // Delete a head of study program
  async delete(id: string): Promise<{ id: string; message: string }> {
    // check if id is uuid
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Invalid ID format. ID must be a valid UUID.',
      );
    }

    // check if id is in database
    await this.getHeadById(id);

    // delete from database
    await this.prisma.headStudyProgram.delete({
      where: { id },
    });
    await this.prisma.user.delete({
      where: { id },
    });

    return { id, message: 'Deleted successfully' };
  }

  // Update a head of study program's study program
  async update(
    id: string,
    updateDto: UpdateHeadOfStudyProgramDto,
  ): Promise<{
    id: string;
    studyProgramId: string;
    isActive: boolean;
    message: string;
  }> {
    let updated = false;
    // check if id is uuid
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Invalid ID format. ID must be a valid UUID.',
      );
    }

    // check if id is in database and get the previous study program
    let msgStudyProgramId = (await this.getHeadById(id)).studyProgramId;

    // check if name is filled
    if (updateDto.name) {
      // update name
      await this.prisma.user.update({
        where: { id },
        data: { name: updateDto.name },
      });

      // change variable
      updated = true;
    }

    // check if name is filled
    if (updateDto.studyProgramId) {
      // check if study program id is uuid
      if (!isUUID(updateDto.studyProgramId)) {
        throw new BadRequestException(
          'Invalid ID format. ID must be a valid UUID.',
        );
      }

      // check if study program id is in databse
      await this.getStudyProgramById(updateDto.studyProgramId);

      // check if study program is available, if not throw error
      const isAvailable = await this.isStudyProgramAvailable(
        id,
        updateDto.studyProgramId,
      );
      if (!isAvailable) {
        throw new BadRequestException(
          `Study Program with ID ${updateDto.studyProgramId} is not available`,
        );
      }

      // update head of study's study program
      await this.prisma.headStudyProgram.update({
        where: { id },
        data: {
          studyProgramId: updateDto.studyProgramId,
          isActive: updateDto.isActive,
        },
      });

      // change variable
      msgStudyProgramId = updateDto.studyProgramId;
      updated = true;
    }

    const changeActive = updateDto.isActive as boolean;
    if (updated) {
      return {
        id,
        isActive: changeActive,
        studyProgramId: msgStudyProgramId,
        message: 'Updated successfully',
      };
    } else {
      return {
        id,
        isActive: changeActive,
        studyProgramId: msgStudyProgramId,
        message: 'No changes were made',
      };
    }
  }
}
