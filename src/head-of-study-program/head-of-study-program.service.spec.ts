import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, HeadStudyProgram, StudyProgram } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { hash, secure, unsecure } from 'src/common/util/security';

describe('HeadOfStudyProgramService', () => {
  let headOfStudyProgramService: HeadOfStudyProgramService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfStudyProgramService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    headOfStudyProgramService = module.get<HeadOfStudyProgramService>(
      HeadOfStudyProgramService,
    );
  });

  const studyProgram: StudyProgram = {
    id: 'studyprogram2',
    name: 'Study Program 2',
  };

  const studyProgramTest: StudyProgram = {
    id: 'studyprogramTest',
    name: 'Study Program Test',
  };

  const studyProgramNew: StudyProgram = {
    id: 'studyprogramNew',
    name: 'Study Program New',
  }

  const registerKaprodiDTO: CreateHeadOfStudyProgramDto = {
    email: 'kaprodi@gmail.com',
    name: 'Test kaprodi',
    password: 'passwordKaprpdi',
    studyProgramId: studyProgram.id,
  };

  const headOfStudyProgram: HeadStudyProgram = {
    id: 'id',
    studyProgramId: studyProgram.id,
  }

  const headOfStudyProgram2: HeadStudyProgram = {
    id: 'id2',
    studyProgramId: studyProgramTest.id,
  }

  const headOfStudyProgramNew: HeadStudyProgram = {
    id: headOfStudyProgram.id,
    studyProgramId: studyProgramNew.id
  }

  const allHeads: HeadStudyProgram[] = [headOfStudyProgram, headOfStudyProgram2]
  const allHeadsId = [allHeads[0].id, allHeads[1].id]

  const cleanData = [
    {
      id: 'id',
      name: registerKaprodiDTO.email,
      headStudyProgram: {
        studyProgram: {
          name: studyProgram.name,
        },
      },
      email: registerKaprodiDTO.email,
    },
  ];

  describe('register', () => {
    describe('register kaprodi', () => {
      it('should register kaprodi successfully', async () => {
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        prismaMock.headStudyProgram.create.mockResolvedValue({
          id: 'id',
          studyProgramId: registerKaprodiDTO.studyProgramId,
        });

        await headOfStudyProgramService.create(registerKaprodiDTO);
        expect(prismaMock.user.create).toBeCalledTimes(1);
      });

      it('should throw BadRequest if email already exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue({
          id: 'id',
          email: 'kaprodi@gmail.com',
          name: 'Test kaprodi',
          password: 'passwordKaprpdi',
          role: 'HEAD_STUDY_PROGRAM',
        });

        await expect(
          headOfStudyProgramService.create(registerKaprodiDTO),
        ).rejects.toThrow(BadRequestException);
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if head of study program not exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(null);

        await expect(
          headOfStudyProgramService.create(registerKaprodiDTO),
        ).rejects.toThrow(BadRequestException);
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });
  });

  describe('findAll', () => {
    it('should return all head of study programs', async () => {
      const hashEmail = await hash(registerKaprodiDTO.email);
      const secureEmail = await secure(hashEmail);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'id',
          email: secureEmail,
          name: 'Test kaprodi',
          password: 'passwordKaprpdi',
          role: 'HEAD_STUDY_PROGRAM',
        },
      ]);

      expect(await headOfStudyProgramService.findAll()).toHaveLength(1);
    });

    it('should return an empty array if no head of study program exist', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.headStudyProgram.findMany.mockResolvedValue([]);

      expect(await headOfStudyProgramService.findAll()).toEqual([]);
    });
  });

  describe('deleteMultiple', () => {
    it("should successfully delete many head of study programs", async () => {
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      prismaMock.headStudyProgram.deleteMany.mockResolvedValue({ count: allHeadsId.length });

      expect(await headOfStudyProgramService.deleteMultiple(allHeadsId)).toEqual({
        ids: allHeadsId,
        message: "Deleted successfully",
      });
      expect(prismaMock.headStudyProgram.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: allHeadsId },
        },
      });
      expect(prismaMock.headStudyProgram.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: allHeadsId },
        },
      });
    });

    it("should throw NotFoundException if any of the head of study programs are not found", async () => {
      const nonExistentIds = [allHeadsId[0], 'nonExistingId2'];
      prismaMock.headStudyProgram.findMany.mockResolvedValue([]);
  
      await expect(headOfStudyProgramService.deleteMultiple(nonExistentIds)).rejects.toThrow(
        NotFoundException,
      );
  
      expect(prismaMock.headStudyProgram.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: nonExistentIds }
        },
      });
      
      expect(prismaMock.headStudyProgram.deleteMany).toHaveBeenCalledTimes(0);
    });
  });

  describe('delete', () => {
    it("should successfully delete a head of study program", async () => {
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram)
      prismaMock.headStudyProgram.delete.mockResolvedValue(headOfStudyProgram);

      expect(await headOfStudyProgramService.delete(headOfStudyProgram.id)).toEqual({
        id: headOfStudyProgram.id,
        message: "Deleted successfully",
      });
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledWith({
        where: {
          id: headOfStudyProgram.id
        },
      });
    });

    it("should throw NotFoundException if head of study program is not found", async () => {
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.delete(headOfStudyProgram.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledTimes(0)
    });
  });

  describe('update', () => {
    it('should successfully update the program study of a head of program study', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.update.mockResolvedValue(headOfStudyProgramNew);
  
      await expect(headOfStudyProgramService.update(id, { studyProgramId: studyProgramId })).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: "Updated successfully"
      });
    });
  
    it('should throw NotFoundException if the head of program study does not exist', async () => {
      const idNotExist = "notExist";
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);
  
      await expect(headOfStudyProgramService.update(idNotExist, { studyProgramId: studyProgramId }))
        .rejects.toThrow(NotFoundException);
    });
  
    it('should throw NotFoundException if the new program study does not exist', async () => {
      const id = headOfStudyProgram.id;
      const progIdNotExist = "notExist"
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);
  
      await expect(headOfStudyProgramService.update(id, { studyProgramId: progIdNotExist }))
        .rejects.toThrow(NotFoundException);
    });
  });  
});
