import { Injectable } from '@nestjs/common';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { UpdateHeadOfStudyProgramDto } from './dto/update-head-of-study-program.dto';

@Injectable()
export class HeadOfStudyProgramService {
  create(createHeadOfStudyProgramDto: CreateHeadOfStudyProgramDto) {
    return 'This action adds a new headOfStudyProgram';
  }

  findAll() {
    return `This action returns all headOfStudyProgram`;
  }

  findOne(id: number) {
    return `This action returns a #${id} headOfStudyProgram`;
  }

  update(id: number, updateHeadOfStudyProgramDto: UpdateHeadOfStudyProgramDto) {
    return `This action updates a #${id} headOfStudyProgram`;
  }

  remove(id: number) {
    return `This action removes a #${id} headOfStudyProgram`;
  }
}
