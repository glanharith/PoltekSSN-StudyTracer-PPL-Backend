import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { unsecure } from 'src/common/util/security';

@Injectable()
export class AlumniListService {
  ALUMNI_PER_PAGE = 10;

  constructor(private readonly prisma: PrismaService) {}

  private async preparePagination(page: number, alumniCount: number) {
    if (Number.isNaN(page)) page = 1;
    if (page < 1) page = 1;

    const totalPage = Math.ceil(alumniCount / this.ALUMNI_PER_PAGE);

    if (page > totalPage) page = totalPage;

    const skip = (page - 1) * this.ALUMNI_PER_PAGE;
    const from = skip + 1;
    const to = Math.min(skip + this.ALUMNI_PER_PAGE, alumniCount);

    return {
      page,
      totalAlumni: alumniCount,
      totalPage,
      skip,
      from,
      to,
    };
  }

  async getAllAlumni(page: number) {
    const alumniCount = await this.prisma.user.count({
      where: {
        role: 'ALUMNI',
      },
    });

    if (alumniCount === 0) {
      return {
        users: [],
        pagination: {
          page: 1,
          totalAlumni: 0,
          totalPage: 1,
          skip: 0,
          from: 0,
          to: 0,
        },
      };
    }

    const { skip, ...rest } = await this.preparePagination(page, alumniCount);

    const users = await this.prisma.user.findMany({
      where: {
        role: 'ALUMNI',
      },
      take: this.ALUMNI_PER_PAGE,
      skip,
      select: {
        name: true,
        id: false,
        email: true,
        password: false,
        role: false,
        alumni: {
          select: {
            id: false,
            npm: true,
            phoneNo: true,
            address: true,
            gender: true,
            enrollmentYear: true,
            graduateYear: true,
            studyProgramId: true,
            studyProgram: {
              select: {
                id: false,
                name: true,
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      if (user.alumni) {
        if (user.alumni.address) {
          user.alumni.address = await unsecure(user.alumni.address);
        }
        if (user.alumni.phoneNo) {
          user.alumni.phoneNo = await unsecure(user.alumni.phoneNo);
        }
        if (user.email) {
          user.email = await unsecure(user.email);
        }
      }
    }
    return { users, pagination: { ...rest } };
  }

  async getAllAlumnibyProdi(headEmail: string, page: number) {
    const head = await this.prisma.user.findUnique({
      where: {
        email: headEmail,
      },
      select: {
        headStudyProgram: {
          select: {
            studyProgramId: true,
          },
        },
      },
    });
    if (!head) throw new NotFoundException('User not found');
    if (!head.headStudyProgram) throw new NotFoundException('User not found');

    const alumniCount = await this.prisma.user.count({
      where: {
        role: 'ALUMNI',
        alumni: {
          studyProgramId: head.headStudyProgram.studyProgramId,
        },
      },
    });

    if (alumniCount === 0) {
      return {
        users: [],
        pagination: {
          page: 1,
          totalAlumni: 0,
          totalPage: 1,
          skip: 0,
          from: 0,
          to: 0,
        },
      };
    }

    const { skip, ...rest } = await this.preparePagination(page, alumniCount);

    const users = await this.prisma.user.findMany({
      where: {
        role: 'ALUMNI',
        alumni: {
          studyProgramId: head.headStudyProgram.studyProgramId,
        },
      },
      take: this.ALUMNI_PER_PAGE,
      skip,
      select: {
        name: true,
        id: false,
        email: true,
        password: false,
        role: false,
        alumni: {
          select: {
            id: false,
            npm: true,
            phoneNo: true,
            address: true,
            gender: true,
            enrollmentYear: true,
            graduateYear: true,
            studyProgramId: true,
            studyProgram: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      if (user.alumni) {
        if (user.alumni.address) {
          user.alumni.address = await unsecure(user.alumni.address);
        }
        if (user.alumni.phoneNo) {
          user.alumni.phoneNo = await unsecure(user.alumni.phoneNo);
        }
        if (user.email) {
          user.email = await unsecure(user.email);
        }
      }
    }
    return { users, pagination: { ...rest } };
  }
}
