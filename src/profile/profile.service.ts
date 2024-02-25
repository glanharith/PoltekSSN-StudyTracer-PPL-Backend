import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from './DTO';
import { hash, secure } from 'src/common/util/security';
  @Injectable()
  export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}
  
    async edit({
        name,
        password,
        phoneNo,
        address,
        enrollmentYear,
      }: ProfileDTO, email:string): Promise<any> {
        const hashedPassword = await hash(password);
        const securedPhoneNo = phoneNo ? await secure(phoneNo) : undefined;
        const securedAddress = address ? await secure(address) : undefined;
  
        const updatedUser = await this.prisma.user.update({
            where: {
              email,
            },
            data: {
                name:name,
                password:hashedPassword,
                alumni:{
                    update:{
                        phoneNo:securedPhoneNo,
                        address: securedAddress,
                        enrollmentYear: enrollmentYear
                    }
                }
            },
          });
          return updatedUser
        }
        async getProfilebyId(email: string): Promise<any> {
            const user = await this.prisma.user.findUnique({
                where: {
                    email,
                },
                select: {
                    name:true,
                    id: false,
                    email: false,
                    password: true,
                    role: false,
                    // Ensure alumni object includes all required fields
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
            return user
            // console.log(user.password)
            // const decryptPhoneNo = user.alumni?.phoneNo ? await decrypt(user.alumni?.phoneNo) : undefined;
            // const decryptAddress = user.alumni?.address ? await decrypt(user.alumni?.address) : undefined;
            // const decryptPassword = await decrypt(user.password);
            // console.log(decryptPassword)
            // return {
            //   name: user.name,
            //   password: decryptPassword,
            //   alumni:{
            //     phoneNo: decryptPhoneNo,
            //     address : decryptAddress,
            //     enrollmentYear: user.alumni?.enrollmentYear
            //   }
            // };
        }
  }
  