import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfStudyProgramController } from './head-of-study-program.controller';
import { HeadOfStudyProgramService } from './head-of-study-program.service';

describe('HeadOfStudyProgramController', () => {
  let controller: HeadOfStudyProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadOfStudyProgramController],
      providers: [HeadOfStudyProgramService],
    }).compile();

    controller = module.get<HeadOfStudyProgramController>(HeadOfStudyProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
