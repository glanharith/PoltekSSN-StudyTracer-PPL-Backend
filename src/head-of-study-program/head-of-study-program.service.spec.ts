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
    id: '5e2633ba-435d-41e8-8432-efa2832ce563',
    name: 'Study Program 2',
  };

  const studyProgramTest: StudyProgram = {
    id: '71ebafd1-ba14-44af-97d6-da882a655076',
    name: 'Study Program Test',
  };

  const studyProgramNew: StudyProgram = {
    id: '53509990-9168-4fae-a963-d9c5aec1232a',
    name: 'Study Program New',
  }

  const registerKaprodiDTO: CreateHeadOfStudyProgramDto = {
    email: 'kaprodi@gmail.com',
    name: 'Test kaprodi',
    password: 'passwordKaprpdi',
    studyProgramId: studyProgram.id,
  };

  const headOfStudyProgram: HeadStudyProgram = {
    id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
    studyProgramId: studyProgram.id,
  }

  const headOfStudyProgram2: HeadStudyProgram = {
    id: 'a11960cf-aefe-4e1d-8388-6327e5ca5131',
    studyProgramId: studyProgramTest.id,
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

  // Test cases for delete multiple service kaprodi
  describe('deleteMultiple', () => {
    // if successful
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

    // if not a valid id
    it('should throw BadRequestException if any ID is not a valid UUID', async () => {
      const invalidUUIDs = [allHeadsId[0], 'invalid-uuid-2'];
      await expect(headOfStudyProgramService.deleteMultiple(invalidUUIDs)).rejects.toThrow(BadRequestException);
    });

    // if a head of study program is not found
    it("should throw NotFoundException if any of the head of study programs are not found", async () => {
      const nonExistentIds = [allHeadsId[0], '3e38460a-d62f-41b3-a31a-38208de69d0d'];
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

  // Test cases for delete service kaprodi
  describe('delete', () => {
    // if successful
    it("should successfully delete a head of study program", async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram)
      prismaMock.headStudyProgram.delete.mockResolvedValue(headOfStudyProgram);

      expect(await headOfStudyProgramService.delete(id)).toEqual({
        id: headOfStudyProgram.id,
        message: "Deleted successfully",
      });
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledWith({
        where: {
          id: headOfStudyProgram.id
        },
      });
    });

    // if not a valid id
    it("should throw BadRequestException if ID is not a valid UUID", async () => {
      const invalidUUID = "invalid-uuid";
      await expect(headOfStudyProgramService.delete(invalidUUID)).rejects.toThrow(BadRequestException);
    });

    // if head of study program not found
    it("should throw NotFoundException if head of study program is not found", async () => {
      const idNotExist = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.delete(idNotExist)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledTimes(0)
    });
  });

  // Test cases for edit/update service kaprodi
  describe('update', () => {
    // if successful
    it('should successfully update the program study of a head of study program', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.count.mockResolvedValue(0);
      prismaMock.headStudyProgram.update.mockResolvedValue({
        id: headOfStudyProgram.id,
        studyProgramId: studyProgramNew.id
      });
  
      await expect(headOfStudyProgramService.update(id, { studyProgramId: studyProgramId })).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: "Updated successfully"
      });
    });

    // if not a valid head of study program id
    it('should throw BadRequestException if head of study program id is not a valid UUID', async () => {
      const invalidUUID = 'invalid-uuid';
      const studyProgramId = studyProgramNew.id;
      await expect(headOfStudyProgramService.update(invalidUUID, { studyProgramId: studyProgramId })).rejects.toThrow(BadRequestException);
    });

    // if not a valid study program id
    it('should throw BadRequestException if study program id is not a valid UUID', async () => {
      const id = headOfStudyProgram.id;
      const invalidUUID = 'invalid-uuid';
      await expect(headOfStudyProgramService.update(id, { studyProgramId: invalidUUID })).rejects.toThrow(BadRequestException);
    });
  
    // if head of study program is not found
    it('should throw NotFoundException if the head of study program does not exist', async () => {
      const idNotExist = "3e38460a-d62f-41b3-a31a-38208de69d0d";
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);
  
      await expect(headOfStudyProgramService.update(idNotExist, { studyProgramId: studyProgramId }))
        .rejects.toThrow(NotFoundException);
    });
  
    // if study program is not found
    it('should throw NotFoundException if the new study program does not exist', async () => {
      const id = headOfStudyProgram.id;
      const progIdNotExist = "3e38460a-d62f-41b3-a31a-38208de69d0d"
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);
  
      await expect(headOfStudyProgramService.update(id, { studyProgramId: progIdNotExist }))
        .rejects.toThrow(NotFoundException);
    });

    // if study program is not available or already has a head of study program
    it('should throw BadRequestException if the new study program is not available', async () => {
      const id = headOfStudyProgram.id;
      const progIdNotAvailable = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.count.mockResolvedValue(1); 

      await expect(headOfStudyProgramService.update(id, { studyProgramId: progIdNotAvailable }))
        .rejects.toThrow(BadRequestException);
    })
  });  

  // Test cases for get head of study program by id kaprodi service
  describe('getHeadById', () => {
    // if successful
    it('should return a head of study program by id', async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(headOfStudyProgram);

      expect(await headOfStudyProgramService.getHeadById(id)).toEqual(headOfStudyProgram);
    });

    // if not found
    it('should throw NotFoundException if the head of study program does not exist', async () => {
      const idNotExit = "3e38460a-d62f-41b3-a31a-38208de69d0d";
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.getHeadById(idNotExit)).rejects.toThrow(NotFoundException);
    });
  });

  // Test cases for get study program by id kaprodi service 
  describe('getStudyProgramById', () => {
    // if successful
    it('should return a study program', async () => {
      const studyProgramId = studyProgram.id;
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);

      expect(await headOfStudyProgramService.getStudyProgramById(studyProgramId)).toEqual(studyProgram);
    });

    // if not found
    it('should throw NotFoundException if study program does not exist', async () => {
      const idNotExit = "3e38460a-d62f-41b3-a31a-38208de69d0d";
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.getStudyProgramById(idNotExit)).rejects.toThrow(NotFoundException);
    });
  });

  // Test cases for get head of study programs by id kaprodi service
  describe('getManyHeadsByIds', () => {
    // if succeessful
    it('should return head of study programs', async () => {
      const ids = allHeadsId;
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      
      expect(await headOfStudyProgramService.getManyHeadByIds(ids)).toEqual(allHeads);
    });

    // if not found
    it('should throw NotFoundException if a head of study program does not exist', async () => {
      const nonExistentIds = [allHeadsId[0], '3e38460a-d62f-41b3-a31a-38208de69d0d'];
      prismaMock.headStudyProgram.findMany.mockResolvedValue([]);
  
      await expect(headOfStudyProgramService.getManyHeadByIds(nonExistentIds)).rejects.toThrow(NotFoundException);
    });
  });

  // Test cases for the availability of a study program
  describe('isStudyProgramAvailable', () => {
    // if available
    it('should return true if study program is available', async () => {
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.count.mockResolvedValue(0);

      expect(await headOfStudyProgramService.isStudyProgramAvailable(studyProgramId)).toEqual(true);
    });

    // if not available
    it('should return false if study program is not available', async () => {
      const studyProgramIdNotAvail = studyProgram.id;
      prismaMock.headStudyProgram.count.mockResolvedValue(1);

      expect(await headOfStudyProgramService.isStudyProgramAvailable(studyProgramIdNotAvail)).toEqual(false);
    });
  });
});
