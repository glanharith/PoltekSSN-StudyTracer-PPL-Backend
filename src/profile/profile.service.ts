import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from './DTO';
import { hash, secure, unsecure } from 'src/common/util/security';
import { compare } from 'bcrypt';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zxcvbnService: ZxcvbnService,
  ) {}

  async edit(
    {
      name,
      password,
      currentPassword,
      phoneNo,
      address,
      enrollmentYear,
    }: ProfileDTO,
    email: string,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (
      (currentPassword === undefined && password !== undefined) ||
      (currentPassword !== undefined && password === undefined)
    ) {
      throw new BadRequestException(
        'Both current password and new password must be provided',
      );
    }
    if (currentPassword) {
      if (!(await compare(currentPassword, user.password))) {
        throw new BadRequestException('Invalid password');
      }

      const passwordScore = await this.zxcvbnService.getScore(
        password as string,
      );

      if (passwordScore <= 2) {
        throw new BadRequestException({
          message: 'Password not strong enough',
        });
      }
    }

    const hashedPassword = password ? await hash(password) : undefined;
    const securedPhoneNo = phoneNo ? await secure(phoneNo) : undefined;
    const securedAddress = address ? await secure(address) : undefined;
    return this.prisma.user.update({
      where: {
        email,
      },
      data: {
        name: name,
        password: hashedPassword,
        alumni: {
          update: {
            phoneNo: securedPhoneNo,
            address: securedAddress,
            enrollmentYear: enrollmentYear,
          },
        },
      },
    });
  }

  async getProfilebyEmail(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        name: true,
        id: false,
        email: false,
        password: false,
        role: false,
        alumni: {
          select: {
            id: false,
            npm: true,
            phoneNo: true,
            address: true,
            gender: false,
            enrollmentYear: true,
            graduateYear: false,
            studyProgramId: false,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.alumni) throw new NotFoundException('User not found');
    const decryptPhoneNo = await unsecure(user.alumni.phoneNo);
    const decryptAddress = await unsecure(user.alumni.address);

    return {
      name: user.name,
      alumni: {
        npm: user.alumni.npm,
        phoneNo: decryptPhoneNo,
        address: decryptAddress,
        enrollmentYear: user.alumni.enrollmentYear,
      },
    };
  }
}
