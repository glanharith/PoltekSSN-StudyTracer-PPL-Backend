import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgram } from '@prisma/client';
import { StudyProgramDTO } from './DTO';
import { StudyProgramController } from './studyProgram.controller';
import { StudyProgramService } from './studyProgram.service';
import { NotFoundException } from '@nestjs/common';

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
    code: 'code',
    level: 'D3',
  };
  const studyProgram2: StudyProgram = {
    id: '221cf51e-df85-43ab-96a3-13bb513e77d3',
    name: 'Information System',
    code: 'code',
    level: 'D3',
  };
  const allStudyPrograms: StudyProgram[] = [studyProgram, studyProgram2];

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

    it('should return NotFoundException if study program does not exists', async () => {
      const nonExistingId = 'nonExistingId';
      studyProgramServiceMock.delete.mockRejectedValue(
        new NotFoundException('Study program not found'),
      );

      try {
        await studyProgramController.deleteStudyProgram(nonExistingId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Study program not found');
      }

      expect(studyProgramServiceMock.delete).toHaveBeenCalledWith(
        nonExistingId,
      );
    });
  });

  describe('DELETE /study-program', () => {
    it('should delete multiple study programs', async () => {
      const idsToDelete = [allStudyPrograms[0].id, allStudyPrograms[1].id];

      studyProgramServiceMock.deleteMultiple.mockResolvedValue(
        allStudyPrograms,
      );

      const result = await studyProgramController.deleteMultipleStudyPrograms(
        idsToDelete,
      );

      expect(studyProgramServiceMock.deleteMultiple).toHaveBeenCalledWith(
        idsToDelete,
      );
      expect(result).toEqual({
        message: 'Successfully deleted study programs',
      });
    });

    it('should throw NotFoundException if there is any study program that is not found', async () => {
      const haveANonExistentId = ['nonexistent-id', studyProgram.id];

      studyProgramServiceMock.deleteMultiple.mockRejectedValue(
        new NotFoundException('Study programs not found'),
      );

      try {
        await studyProgramController.deleteMultipleStudyPrograms(
          haveANonExistentId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Study programs not found');
      }
      expect(studyProgramServiceMock.deleteMultiple).toHaveBeenCalledWith(
        haveANonExistentId,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
