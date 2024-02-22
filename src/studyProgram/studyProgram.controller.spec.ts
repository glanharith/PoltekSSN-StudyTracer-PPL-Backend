import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgram } from '@prisma/client';
import { StudyProgramDTO } from './DTO';
import { StudyProgramController } from './studyProgram.controller';
import { StudyProgramService } from './studyProgram.service';

jest.mock('./studyProgram.service');

describe('StudyProgramController', () => {
  let studyProgramController: StudyProgramController;
  let studyProgramServiceMock: jest.Mocked<StudyProgramService>;

  beforeEach(async () => {
    const studyProgram: TestingModule = await Test.createTestingModule({
      controllers: [StudyProgramController],
      providers: [StudyProgramService],
    }).compile();

    studyProgramController = studyProgram.get<StudyProgramController>(
      StudyProgramController,
    );
    studyProgramServiceMock =
      studyProgram.get<jest.Mocked<StudyProgramService>>(StudyProgramService);
  });

  const studyProgramDTO: StudyProgramDTO = {
    name: 'Computer Science',
  };
  const studyProgram: StudyProgram = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    name: 'Computer Science',
  };

  describe('POST /study-program', () => {
    it('should create a new study program', async () => {
      studyProgramServiceMock.create.mockResolvedValue(studyProgram);

      const result = await studyProgramController.createStudyProgram(
        studyProgramDTO,
      );

      expect(result).toEqual({
        message: 'Successfully created a new study program',
      });
    });
  });

  describe('UPDATE /study-program', () => {
    it('should update a study program', async () => {
      studyProgramServiceMock.update.mockResolvedValue(studyProgram);

      const result = await studyProgramController.updateStudyProgram(
        studyProgram.id,
        studyProgramDTO,
      );

      expect(result).toEqual({
        message: 'Successfully updated a study program',
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
