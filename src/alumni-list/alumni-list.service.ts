import { Injectable, NotFoundException } from "@nestjs/common";
import { Alumni, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ZxcvbnService } from "src/zxcvbn/zxcvbn.service";

@Injectable()
export class AlumniListService{
constructor(
    private readonly prisma: PrismaService,
  ) {}

    async getAllAlumni(): Promise<User[]> {
        return this.prisma.user.findMany({
          where:{
            role: 'ALUMNI'
          }
        })  
    }
    async getAllAlumnibyProdi(headEmail:string): Promise<User[]>{
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
      return this.prisma.user.findMany({
        where:{
          role:'ALUMNI',
          alumni:{
            studyProgramId: head.headStudyProgram.studyProgramId
          }
        }
      })
    }

}