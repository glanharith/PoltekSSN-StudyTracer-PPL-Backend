import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramService } from './studyProgram.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudyProgram } from '@prisma/client';

describe('StudyProgramService', () => {
  let studyProgramService: StudyProgramService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [StudyProgramService, PrismaService],
    }).compile();

    studyProgramService =
      testModule.get<StudyProgramService>(StudyProgramService);
    prismaService = testModule.get<PrismaService>(PrismaService);
  });

  const studyProgram: StudyProgram = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    name: 'Computer Science',
  };
  const updatedStudyProgram: StudyProgram = {
    id: studyProgram.id,
    name: 'Information Systems',
  };

  describe('create', () => {
    it('should create a new study program', async () => {
      jest
        .spyOn(prismaService.studyProgram, 'create')
        .mockResolvedValue(studyProgram);
      jest
        .spyOn(studyProgramService, 'isStudyProgramNameAvailable')
        .mockResolvedValue(true);
      expect(
        (await studyProgramService.create(studyProgram.name)).name,
      ).toEqual(studyProgram.name);
    });

    it('should throw ConflictException if a study program of the same name already exists', async () => {
      jest
        .spyOn(studyProgramService, 'isStudyProgramNameAvailable')
        .mockResolvedValue(false);
      await expect(
        studyProgramService.create(studyProgram.name),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('isStudyProgramNameAvailable', () => {
    it('should return true if study program name is available', async () => {
      jest.spyOn(prismaService.studyProgram, 'count').mockResolvedValue(0);
      expect(
        await studyProgramService.isStudyProgramNameAvailable(
          studyProgram.name,
        ),
      ).toEqual(true);
    });

    it('should return false if study program name is taken', async () => {
      jest.spyOn(prismaService.studyProgram, 'count').mockResolvedValue(1);
      expect(
        await studyProgramService.isStudyProgramNameAvailable(
          studyProgram.name,
        ),
      ).toEqual(false);
    });
  });

  describe('update', () => {
    it('should update study program', async () => {
      jest
        .spyOn(studyProgramService, 'getStudyProgramById')
        .mockResolvedValue(studyProgram);
      jest
        .spyOn(prismaService.studyProgram, 'update')
        .mockResolvedValue(updatedStudyProgram);
      expect(
        await studyProgramService.update(
          studyProgram.id,
          updatedStudyProgram.name,
        ),
      ).toEqual(updatedStudyProgram);
    });

    it('should return NotFoundException if study program is not found', async () => {
      jest
        .spyOn(prismaService.studyProgram, 'findUnique')
        .mockResolvedValue(null);
      await expect(
        studyProgramService.update(studyProgram.id, updatedStudyProgram.name),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new study program name is already used', async () => {
      jest
        .spyOn(studyProgramService, 'getStudyProgramById')
        .mockResolvedValue(studyProgram);
      jest
        .spyOn(studyProgramService, 'isStudyProgramNameAvailable')
        .mockResolvedValue(false);
      await expect(
        studyProgramService.update(studyProgram.id, updatedStudyProgram.name),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getStudyProgramById', () => {
    it('should return study program info if it exists', async () => {
      jest
        .spyOn(prismaService.studyProgram, 'findUnique')
        .mockResolvedValue(studyProgram);

      expect(
        await studyProgramService.getStudyProgramById(studyProgram.id),
      ).toEqual(studyProgram);
    });

    it('should return NotFoundException if study program does not exists', async () => {
      jest
        .spyOn(prismaService.studyProgram, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        studyProgramService.getStudyProgramById(studyProgram.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });
});
