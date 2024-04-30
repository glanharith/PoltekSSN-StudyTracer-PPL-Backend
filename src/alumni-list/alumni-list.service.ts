import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { unsecure } from 'src/common/util/security';

@Injectable()
export class AlumniListService{
constructor(
    private readonly prisma: PrismaService,
  ) {}

    async getAllAlumni(): Promise<any[]> {
        const users= await this.prisma.user.findMany({
          where:{
            role: 'ALUMNI'
          },
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
                studyProgramId: false,
                studyProgram: {
                  select:{
                    id: false,
                    name:true
                  }
                }
              },
            },
          },
        })  

        for(const user of users){
          if(user.alumni){
            if(user.alumni.address){
              user.alumni.address = await unsecure(user.alumni.address);
            }
            if(user.alumni.phoneNo){
              user.alumni.phoneNo = await unsecure(user.alumni.phoneNo);
            }
            if(user.email){
              user.email = await unsecure(user.email);
            }
          }
        }
        return users;

    }
    async getAllAlumnibyProdi(headEmail:string): Promise<any[]>{
      const head = await this.prisma.user.findUnique({
        where:{
          email: headEmail
        },
        select:{
          headStudyProgram:{
            select:{
              studyProgramId: true
            }
          }
        }
      })
      if (!head) throw new NotFoundException('User not found');
      if(!head.headStudyProgram) throw new NotFoundException('User not found');
      const users = await this.prisma.user.findMany({
        where:{
          role:'ALUMNI',
          alumni:{
            studyProgramId: head.headStudyProgram.studyProgramId
          }
        },
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
                select:{
                  name:true
                }
              }
            },
          },
        },
      })
      for(const user of users){
        if(user.alumni){
          if(user.alumni.address){
            user.alumni.address = await unsecure(user.alumni.address);
          }
          if(user.alumni.phoneNo){
            user.alumni.phoneNo = await unsecure(user.alumni.phoneNo);
          }
          if(user.email){
            user.email = await unsecure(user.email);
          }   
        }
      }
      return users;
    }

}