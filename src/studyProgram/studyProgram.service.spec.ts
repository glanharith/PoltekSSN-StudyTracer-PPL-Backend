import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramService } from './studyProgram.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient, StudyProgram } from '@prisma/client';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { DeepMockProxy } from 'jest-mock-extended';

describe('StudyProgramService', () => {
  let studyProgramService: StudyProgramService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        StudyProgramService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    studyProgramService =
      testModule.get<StudyProgramService>(StudyProgramService);
  });

  const studyProgram: StudyProgram = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    name: 'Computer Science',
  };
  const updatedStudyProgram: StudyProgram = {
    id: studyProgram.id,
    name: 'Information Systems',
  };
  const allStudyPrograms: StudyProgram[] = [studyProgram, updatedStudyProgram];
  const allStudyProgramsIds = [allStudyPrograms[0].id, allStudyPrograms[1].id];

  describe('create', () => {
    it('should create a new study program', async () => {
      prismaMock.studyProgram.create.mockResolvedValue(studyProgram);
      prismaMock.studyProgram.count.mockResolvedValue(0);

      expect(
        (await studyProgramService.create(studyProgram.name)).name,
      ).toEqual(studyProgram.name);
      expect(prismaMock.studyProgram.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if a study program of the same name already exists', async () => {
      prismaMock.studyProgram.count.mockResolvedValue(1);

      await expect(
        studyProgramService.create(studyProgram.name),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.studyProgram.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('isStudyProgramNameAvailable', () => {
    it('should return true if study program name is available', async () => {
      prismaMock.studyProgram.count.mockResolvedValue(0);

      expect(
        await studyProgramService.isStudyProgramNameAvailable(
          studyProgram.name,
        ),
      ).toEqual(true);
    });

    it('should return false if study program name is taken', async () => {
      prismaMock.studyProgram.count.mockResolvedValue(1);

      expect(
        await studyProgramService.isStudyProgramNameAvailable(
          studyProgram.name,
        ),
      ).toEqual(false);
    });
  });

  describe('update', () => {
    it('should update study program', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
      prismaMock.studyProgram.count.mockResolvedValue(0);
      prismaMock.studyProgram.update.mockResolvedValue(updatedStudyProgram);

      expect(
        await studyProgramService.update(
          studyProgram.id,
          updatedStudyProgram.name,
        ),
      ).toEqual(updatedStudyProgram);
      expect(prismaMock.studyProgram.update).toHaveBeenCalledTimes(1);
    });

    it('should return NotFoundException if study program is not found', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(
        studyProgramService.update(studyProgram.id, updatedStudyProgram.name),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.studyProgram.update).toHaveBeenCalledTimes(0);
    });

    it('should throw ConflictException if new study program name is taken', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
      prismaMock.studyProgram.count.mockResolvedValue(1);

      await expect(
        studyProgramService.update(studyProgram.id, updatedStudyProgram.name),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.studyProgram.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('getStudyProgramById', () => {
    it('should return study program info if it exists', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);

      expect(
        await studyProgramService.getStudyProgramById(studyProgram.id),
      ).toEqual(studyProgram);
    });

    it('should return NotFoundException if study program does not exists', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(
        studyProgramService.getStudyProgramById(studyProgram.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all study programs', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue(allStudyPrograms);
      
      expect(
        await studyProgramService.findAll(),
      ).toEqual(allStudyPrograms);
      expect(prismaMock.studyProgram.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no study program exist', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue([]);
      
      expect(
        await studyProgramService.findAll(),
      ).toEqual([]);
      expect(prismaMock.studyProgram.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a study program', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
      prismaMock.studyProgram.delete.mockResolvedValue(studyProgram);

      expect(
        await studyProgramService.delete(studyProgram.id)
      ).toEqual(studyProgram);
      expect(prismaMock.studyProgram.delete).toHaveBeenCalledWith({
        where: {
          id: studyProgram.id
        },
      });
    });

    it('should throw NotFoundException if study program is not found', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(
        studyProgramService.delete(studyProgram.id),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.studyProgram.delete).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple study programs and return them', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue(allStudyPrograms);
      prismaMock.studyProgram.deleteMany.mockResolvedValue({ count: allStudyProgramsIds.length });
 
      const result = await studyProgramService.deleteMultiple(allStudyProgramsIds);
 
      expect(result).toEqual(allStudyPrograms);
      expect(prismaMock.studyProgram.findMany).toHaveBeenCalledWith({ where: { id: { in: allStudyProgramsIds } } });
      expect(prismaMock.studyProgram.deleteMany).toHaveBeenCalledWith({ where: { id: { in: allStudyProgramsIds } } });
    });
 
    it('should throw NotFoundException if there is any study program that is not found', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue([studyProgram]);
 
      await expect(studyProgramService.deleteMultiple(allStudyProgramsIds)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.studyProgram.deleteMany).toHaveBeenCalledTimes(0);
    });
  });

  describe('getMultipleStudyProgramsById', () => {
    it('should return study programs info if they are exist', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue(allStudyPrograms);


      expect(
        await studyProgramService.getMultipleStudyProgramsById(allStudyProgramsIds),
      ).toEqual(allStudyPrograms);
    });


    it('should return NotFoundException if study program does not exists', async () => {
      prismaMock.studyProgram.findMany.mockResolvedValue([]);

      await expect(
        studyProgramService.getMultipleStudyProgramsById(allStudyProgramsIds),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
