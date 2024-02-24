import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfStudyProgramService } from './head-of-study-program.service';

describe('HeadOfStudyProgramService', () => {
  let service: HeadOfStudyProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadOfStudyProgramService],
    }).compile();

    service = module.get<HeadOfStudyProgramService>(HeadOfStudyProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
