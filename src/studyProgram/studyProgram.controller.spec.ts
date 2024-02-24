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
  const allStudyPrograms: StudyProgram[] = [studyProgram];

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

  describe('GET /study-program', () => {
    it('should return all study programs', async () => {
      studyProgramServiceMock.findAll.mockResolvedValue(allStudyPrograms);

      const result = await studyProgramController.viewAllStudyProgram();

      expect(result).toEqual({
        message: 'Successfully got all study programs',
        data: allStudyPrograms,
      });
    });

    it('an empty array if no study program exist', async () => {
      studyProgramServiceMock.findAll.mockResolvedValue([]);

      const result = await studyProgramController.viewAllStudyProgram();

      expect(result).toEqual({
        message: 'Successfully got all study programs',
        data: [],
      });
    });
  });

  describe('DELETE /study-program/:id', () => {
    it('should delete a study program', async () => {
      studyProgramServiceMock.delete.mockResolvedValue(studyProgram);

      const result = await studyProgramController.deleteStudyProgram(
        studyProgram.id,
      );

      expect(result).toEqual({
        message: 'Successfully deleted a study program',
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
