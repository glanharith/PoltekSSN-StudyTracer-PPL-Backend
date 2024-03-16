import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './DTO';
import { hash, secure } from 'src/common/util/security';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly zxcvbnService: ZxcvbnService,
  ) {}

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
    npm,
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

    const passwordScore = await this.zxcvbnService.getScore(password);

    if (passwordScore <= 2) {
      throw new BadRequestException({
        message: 'Password not strong enough',
      });
    }

    if (role !== 'ADMIN') {
      if (!studyProgramId) {
        throw new BadRequestException({
          message: 'Fields required for non admin register: studyProgramId',
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
      if (
        !phoneNo ||
        !address ||
        !gender ||
        !enrollmentYear ||
        !graduateYear ||
        !npm
      ) {
        throw new BadRequestException({
          message:
            'Fields required for alumni register: phoneNo, address, gender, enrollmentYear, graduateYear, npm',
        });
      }

      const alumni = await this.prisma.alumni.findFirst({
        where: {
          npm,
        },
      });

      if (alumni) {
        throw new BadRequestException({
          message: 'Alumni with given npm is already exists',
        });
      }

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
              npm,
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

  async login({ email, password }: LoginDTO) {
    const emailHash = await hash(email);

    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          startsWith: `${emailHash}|`,
        },
      },
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid email or password',
      });
    }

    if (user.role == 'HEAD_STUDY_PROGRAM') {
      const kaprodi = await this.prisma.headStudyProgram.findFirst({
        where: {
          user,
        },
      });

      if (!kaprodi) {
        throw new BadRequestException({
          message: 'Invalid Head of Study Program',
        });
      }

      if (!kaprodi.isActive) {
        throw new BadRequestException({
          message: 'The Head of Study Program Account is no Longer Active',
        });
      }
    }
    if (await compare(password, user.password)) {
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      return this.jwtService.sign(payload);
    } else {
      throw new BadRequestException({
        message: 'Invalid email or password',
      });
    }
  }
}
