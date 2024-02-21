import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDTO } from './DTO';
import { hash, secure } from 'src/common/util/security';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register({
    email,
    name,
    password,
    role,
    phoneNo,
    address,
    gender,
    enrollmentYear,
    graduateYear,
    studyProgramId,
  }: RegisterDTO) {
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

    if (role !== 'ADMIN') {
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
    }

    const securedEmail = await secure(email);
    const hashedPassword = await hash(password);

    if (role === 'ADMIN') {
      await this.prisma.user.create({
        data: {
          email: securedEmail,
          name,
          password: hashedPassword,
          role,
          admin: {
            create: {},
          },
        },
      });
    } else if (role === 'ALUMNI') {
      const securedPhoneNo = await secure(phoneNo);
      const securedAddress = await secure(address);

      await this.prisma.user.create({
        data: {
          email: securedEmail,
          name,
          password: hashedPassword,
          role,
          alumni: {
            create: {
              phoneNo: securedPhoneNo,
              address: securedAddress,
              gender,
              enrollmentYear,
              graduateYear,
              studyProgram: {
                connect: {
                  id: studyProgramId,
                },
              },
            },
          },
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email: securedEmail,
          name,
          password: hashedPassword,
          role,
          headStudyProgram: {
            create: {
              studyProgram: {
                connect: {
                  id: studyProgramId,
                },
              },
            },
          },
        },
      });
    }
  }
}
