import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from './DTO';
import { hash, secure, unsecure } from 'src/common/util/security';
@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async edit(
    { name, password, phoneNo, address, enrollmentYear }: ProfileDTO,
    email: string,
  ): Promise<any> {
    const hashedPassword = await hash(password);
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
        phoneNo: decryptPhoneNo,
        address: decryptAddress,
        enrollmentYear: user.alumni.enrollmentYear,
      },
    };
  }
}
