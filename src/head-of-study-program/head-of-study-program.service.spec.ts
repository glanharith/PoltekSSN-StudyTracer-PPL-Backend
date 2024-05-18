import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { DeepMockProxy } from 'jest-mock-extended';
import {
  PrismaClient,
  HeadStudyProgram,
  StudyProgram,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { hash, secure } from 'src/common/util/security';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';
import exp from 'constants';

jest.mock('src/zxcvbn/zxcvbn.service');
describe('HeadOfStudyProgramService', () => {
  let headOfStudyProgramService: HeadOfStudyProgramService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let zxcvbnService: jest.Mocked<ZxcvbnService>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ZxcvbnModule],
      providers: [
        HeadOfStudyProgramService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    headOfStudyProgramService = module.get<HeadOfStudyProgramService>(
      HeadOfStudyProgramService,
    );
    zxcvbnService = module.get<jest.Mocked<ZxcvbnService>>(ZxcvbnService);
  });

  const studyProgram: StudyProgram = {
    id: '5e2633ba-435d-41e8-8432-efa2832ce563',
    name: 'Study Program 2',
    code: 'code',
    level: 'D3',
  };

  const studyProgramTest: StudyProgram = {
    id: '71ebafd1-ba14-44af-97d6-da882a655076',
    name: 'Study Program Test',
    code: 'code',
    level: 'D3',
  };

  const studyProgramNew: StudyProgram = {
    id: '53509990-9168-4fae-a963-d9c5aec1232a',
    name: 'Study Program New',
    code: 'code',
    level: 'D3',
  };

  const registerKaprodiDTO: CreateHeadOfStudyProgramDto = {
    email: 'kaprodi@gmail.com',
    name: 'Test kaprodi',
    password: 'passwordKaprpdi',
    studyProgramId: studyProgram.id,
    nip: '123',
  };

  const headOfStudyProgram: HeadStudyProgram = {
    id: 'ba20eb7a-8667-4a82-a18d-47aca6cf84ef',
    studyProgramId: studyProgram.id,
    isActive: true,
    nip: '123',
  };

  const headOfStudyProgram2: HeadStudyProgram = {
    id: 'a11960cf-aefe-4e1d-8388-6327e5ca5131',
    studyProgramId: studyProgramTest.id,
    isActive: true,
    nip: '123',
  };

  const headUser: User = {
    id: headOfStudyProgram.id,
    email: 'kaprodi@gmail.com',
    name: 'Test kaprodi',
    password: 'passwordKaprpdi',
    role: 'HEAD_STUDY_PROGRAM',
  };

  const headUser2: User = {
    id: headOfStudyProgram2.id,
    email: 'kaprodi2@gmail.com',
    name: 'Test kaprodi2',
    password: 'passwordKaprpdi2',
    role: 'HEAD_STUDY_PROGRAM',
  };

  const allHeads: HeadStudyProgram[] = [
    headOfStudyProgram,
    headOfStudyProgram2,
  ];
  const allUsers: User[] = [headUser, headUser2];
  const allHeadsId = [allHeads[0].id, allHeads[1].id];

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
          isActive: true,
          nip: 'nip',
        });
        zxcvbnService.getScore.mockResolvedValue(5);

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

      it('should throw BadRequest if kaprodi with same nip is exist', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        prismaMock.headStudyProgram.findFirst.mockResolvedValue(
          headOfStudyProgram,
        );

        await expect(
          headOfStudyProgramService.create(registerKaprodiDTO),
        ).rejects.toThrow(BadRequestException);
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if kaprodi with same study program is exist', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        prismaMock.headStudyProgram.count.mockResolvedValue(1);

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

      it('should throw BadRequest if password not strong enough', async () => {
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        zxcvbnService.getScore.mockResolvedValue(1);

        await expect(
          headOfStudyProgramService.create(registerKaprodiDTO),
        ).rejects.toThrow(BadRequestException);
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });
  });

  describe('findAll', () => {
    it('should return all head of study programs', async () => {
      const page = 1;
      const secureEmail = await secure( cleanData[0].email);
      cleanData[0].email = secureEmail
      const findUniqueMock = jest.fn().mockResolvedValue(studyProgram);
      const findManyMock = jest.fn().mockResolvedValue(cleanData);
      const countMock = jest.fn().mockResolvedValue(cleanData.length);
      const headService = new HeadOfStudyProgramService({
        user: { findMany: findManyMock, count: countMock, findUnique:findUniqueMock  },
      } as any, zxcvbnService);

      const result = await headService.findAll(page);
      cleanData[0].email = registerKaprodiDTO.email
      expect(result).toEqual({
        data: cleanData,
        pagination: {
          page: 1,
          from: 1,
          to: 1,
          totalHead: 1,
          totalPage: 1,
        },
      });

    });

    it('should return an empty array if no head of study program exist', async () => {
      const page = 1;
      const findUniqueMock = jest.fn().mockResolvedValue(studyProgram);
      const findManyMock = jest.fn().mockResolvedValue([]);
      const countMock = jest.fn().mockResolvedValue(0);
      const headService = new HeadOfStudyProgramService({
        user: { findMany: findManyMock, count: countMock, findUnique:findUniqueMock  },
      } as any, zxcvbnService);

      const result = await headService.findAll(page);
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          from: 0,
          skip:0,
          to: 0,
          totalHead: 0,
          totalPage: 1,
        },
      });
    });
  });

  // Test cases for delete multiple service kaprodi
  describe('deleteMultiple', () => {
    // if successful
    it('should successfully delete many head of study programs', async () => {
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      prismaMock.user.findMany.mockResolvedValue(allUsers);
      prismaMock.headStudyProgram.deleteMany.mockResolvedValue({
        count: allHeadsId.length,
      });

      expect(
        await headOfStudyProgramService.deleteMultiple(allHeadsId),
      ).toEqual({
        ids: allHeadsId,
        message: 'Deleted successfully',
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
      await expect(
        headOfStudyProgramService.deleteMultiple(invalidUUIDs),
      ).rejects.toThrow(BadRequestException);
    });

    // if a head of study program is not found
    it('should throw NotFoundException if any of the head of study programs are not found', async () => {
      const nonExistentIds = [
        allHeadsId[0],
        '3e38460a-d62f-41b3-a31a-38208de69d0d',
      ];
      prismaMock.headStudyProgram.findMany.mockResolvedValue([]);

      await expect(
        headOfStudyProgramService.deleteMultiple(nonExistentIds),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.headStudyProgram.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: nonExistentIds },
        },
      });

      expect(prismaMock.headStudyProgram.deleteMany).toHaveBeenCalledTimes(0);
    });

    // if user not found
    it('should throw NotFoundException if head of study program is not found', async () => {
      const ids = allHeadsId;
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(
        headOfStudyProgramService.deleteMultiple(allHeadsId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.headStudyProgram.deleteMany).toHaveBeenCalledTimes(0);
    });
  });

  // Test cases for delete service kaprodi
  describe('delete', () => {
    // if successful
    it('should successfully delete a head of study program', async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.headStudyProgram.delete.mockResolvedValue(headOfStudyProgram);

      expect(await headOfStudyProgramService.delete(id)).toEqual({
        id: headOfStudyProgram.id,
        message: 'Deleted successfully',
      });
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledWith({
        where: {
          id: headOfStudyProgram.id,
        },
      });
    });

    // if not a valid id
    it('should throw BadRequestException if ID is not a valid UUID', async () => {
      const invalidUUID = 'invalid-uuid';
      await expect(
        headOfStudyProgramService.delete(invalidUUID),
      ).rejects.toThrow(BadRequestException);
    });

    // if head of study program not found
    it('should throw NotFoundException if head of study program is not found', async () => {
      const idNotExist = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(
        headOfStudyProgramService.delete(idNotExist),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledTimes(0);
    });

    // if user not found
    it('should throw NotFoundException if head of study program is not found', async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.delete(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.headStudyProgram.delete).toHaveBeenCalledTimes(0);
    });
  });

  // Test cases for edit/update service kaprodi
  describe('update', () => {
    // if successful
    it('should successfully update a head of study program', async () => {
      const id = headOfStudyProgram.id;
      const name = 'New name';
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.count.mockResolvedValue(0);
      prismaMock.headStudyProgram.update.mockResolvedValue({
        id: headOfStudyProgram.id,
        studyProgramId: studyProgramNew.id,
        isActive: true,
        nip: 'nip',
      });
      prismaMock.user.update.mockResolvedValue({
        id: headUser.id,
        email: headUser.email,
        password: headUser.password,
        role: headUser.role,
        name: name,
      });

      await expect(
        headOfStudyProgramService.update(id, {
          name: name,
          studyProgramId: studyProgramId,
        }),
      ).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: 'Updated successfully',
      });
    });

    // if successful partial update name
    it('should successfully update name of a head of study program', async () => {
      const id = headOfStudyProgram.id;
      const name = 'New name';
      const studyProgramId = headOfStudyProgram.studyProgramId;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.user.update.mockResolvedValue({
        id: headUser.id,
        email: headUser.email,
        password: headUser.password,
        role: headUser.role,
        name: name,
      });
      prismaMock.headStudyProgram.update.mockResolvedValue(headOfStudyProgram);

      await expect(
        headOfStudyProgramService.update(id, { name: name }),
      ).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: 'Updated successfully',
      });
    });

    // if successful partial update study program
    it('should successfully update study program of a head of study program', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.count.mockResolvedValue(0);
      prismaMock.headStudyProgram.update.mockResolvedValue({
        id: headOfStudyProgram.id,
        studyProgramId: studyProgramNew.id,
        isActive: true,
        nip: 'nip',
      });
      prismaMock.user.update.mockResolvedValue(headUser);

      await expect(
        headOfStudyProgramService.update(id, {
          studyProgramId: studyProgramId,
        }),
      ).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: 'Updated successfully',
      });
    });

    // if successful no updates happen
    it('should successfully not update a head of study program if no field is changed', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = headOfStudyProgram.studyProgramId;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.user.update.mockResolvedValue(headUser);
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );

      await expect(headOfStudyProgramService.update(id, {})).resolves.toEqual({
        id: id,
        studyProgramId: studyProgramId,
        message: 'No changes were made',
      });
    });

    // if not a valid head of study program id
    it('should throw BadRequestException if head of study program id is not a valid UUID', async () => {
      const invalidUUID = 'invalid-uuid';
      const studyProgramId = studyProgramNew.id;
      await expect(
        headOfStudyProgramService.update(invalidUUID, {
          studyProgramId: studyProgramId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    // if not a valid study program id
    it('should throw BadRequestException if study program id is not a valid UUID', async () => {
      const id = headOfStudyProgram.id;
      const invalidUUID = 'invalid-uuid';
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      await expect(
        headOfStudyProgramService.update(id, { studyProgramId: invalidUUID }),
      ).rejects.toThrow(BadRequestException);
    });

    // if head of study program is not found
    it('should throw NotFoundException if the head of study program does not exist', async () => {
      const idNotExist = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(
        headOfStudyProgramService.update(idNotExist, {
          studyProgramId: studyProgramId,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    // if study program is not found
    it('should throw NotFoundException if the new study program does not exist', async () => {
      const id = headOfStudyProgram.id;
      const progIdNotExist = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(
        headOfStudyProgramService.update(id, {
          studyProgramId: progIdNotExist,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    // if study program is not available or already has a head of study program
    it('should throw BadRequestException if the new study program is not available', async () => {
      const id = headOfStudyProgram.id;
      const progIdNotAvailable = studyProgramNew.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgramNew);
      prismaMock.headStudyProgram.count.mockResolvedValue(1);

      await expect(
        headOfStudyProgramService.update(id, {
          studyProgramId: progIdNotAvailable,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // Test cases for get head of study program by id kaprodi service
  describe('getHeadById', () => {
    // if successful
    it('should return a head of study program by id', async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(headUser);

      expect(await headOfStudyProgramService.getHeadById(id)).toEqual(
        headOfStudyProgram,
      );
    });

    // if head not found
    it('should throw NotFoundException if the head of study program does not exist', async () => {
      const idNotExist = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(null);

      await expect(
        headOfStudyProgramService.getHeadById(idNotExist),
      ).rejects.toThrow(NotFoundException);
    });

    // if user not found
    it('should throw NotFoundException if the user does not exist', async () => {
      const id = headOfStudyProgram.id;
      prismaMock.headStudyProgram.findUnique.mockResolvedValue(
        headOfStudyProgram,
      );
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(headOfStudyProgramService.getHeadById(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Test cases for get study program by id kaprodi service
  describe('getStudyProgramById', () => {
    // if successful
    it('should return a study program', async () => {
      const studyProgramId = studyProgram.id;
      prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);

      expect(
        await headOfStudyProgramService.getStudyProgramById(studyProgramId),
      ).toEqual(studyProgram);
    });

    // if not found
    it('should throw NotFoundException if study program does not exist', async () => {
      const idNotExit = '3e38460a-d62f-41b3-a31a-38208de69d0d';
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);

      await expect(
        headOfStudyProgramService.getStudyProgramById(idNotExit),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // Test cases for get head of study programs by id kaprodi service
  describe('getManyHeadsByIds', () => {
    // if succeessful
    it('should return head of study programs', async () => {
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      prismaMock.user.findMany.mockResolvedValue(allUsers);

      expect(
        await headOfStudyProgramService.getManyHeadByIds(allHeadsId),
      ).toEqual(allHeads);
    });

    // if not found
    it('should throw NotFoundException if a head of study program does not exist', async () => {
      const nonExistentIds = [
        allHeadsId[0],
        '3e38460a-d62f-41b3-a31a-38208de69d0d',
      ];
      prismaMock.headStudyProgram.findMany.mockResolvedValue([]);

      await expect(
        headOfStudyProgramService.getManyHeadByIds(nonExistentIds),
      ).rejects.toThrow(NotFoundException);
    });

    // if user not found
    it('should  throw NotFoundException if a head of study program does not exist', async () => {
      const ids = allHeadsId;
      prismaMock.headStudyProgram.findMany.mockResolvedValue(allHeads);
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(
        headOfStudyProgramService.getManyHeadByIds(ids),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // Test cases for the availability of a study program
  describe('isStudyProgramAvailable', () => {
    // if available
    it('should return true if study program is available', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = studyProgramNew.id;
      prismaMock.headStudyProgram.count.mockResolvedValue(0);

      expect(
        await headOfStudyProgramService.isStudyProgramAvailable(
          id,
          studyProgramId,
        ),
      ).toEqual(true);
    });

    // if the selected study program is the current user's
    it('should return true that it is its own study program', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramId = headOfStudyProgram.studyProgramId;
      prismaMock.headStudyProgram.count.mockResolvedValue(0);

      expect(
        await headOfStudyProgramService.isStudyProgramAvailable(
          id,
          studyProgramId,
        ),
      ).toEqual(true);
    });

    // if not available
    it('should return false if study program is not available', async () => {
      const id = headOfStudyProgram.id;
      const studyProgramIdNotAvail = studyProgramTest.id;
      prismaMock.headStudyProgram.count.mockResolvedValue(1);

      expect(
        await headOfStudyProgramService.isStudyProgramAvailable(
          id,
          studyProgramIdNotAvail,
        ),
      ).toEqual(false);
    });
  });
});
