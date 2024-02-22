import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDTO } from './DTO';
import { PrismaClient, StudyProgram } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy } from 'jest-mock-extended';
import { createPrismaMock } from 'src/prisma/prisma.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const studyProgram: StudyProgram = {
      id: 'studyprogram1',
      name: 'Study Program 1',
    };

    describe('register admin', () => {
      const registerAdminDTO: RegisterDTO = {
        email: 'admin@gmail.com',
        name: 'Test Admin',
        password: 'passwordadmin',
        role: 'ADMIN',
      };

      it('should register admin successfully', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
          id: 'id',
          ...registerAdminDTO,
        });

        await authService.register(registerAdminDTO);
        expect(prismaMock.user.create).toBeCalledTimes(1);
      });

      it('should throw BadRequest if email already exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue({
          id: 'id',
          ...registerAdminDTO,
        });

        await expect(authService.register(registerAdminDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });

    describe('register alumni', () => {
      const registerAlumniDTO: RegisterDTO = {
        email: 'alumni@gmail.com',
        name: 'Test Alumni',
        password: 'passwordalumni',
        role: 'ALUMNI',
        phoneNo: '081234567890',
        address: 'address',
        gender: 'MALE',
        enrollmentYear: 2019,
        graduateYear: 2023,
        studyProgramId: studyProgram.id,
      };

      it('should register alumni successfully', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        prismaMock.user.create.mockResolvedValue({
          id: 'id',
          ...registerAlumniDTO,
        });

        await authService.register(registerAlumniDTO);
        expect(prismaMock.user.create).toBeCalledTimes(1);
      });

      it('should throw BadRequest if email already exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue({
          id: 'id',
          ...registerAlumniDTO,
        });

        await expect(authService.register(registerAlumniDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if study program not exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(null);

        await expect(authService.register(registerAlumniDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });

    describe('register head of study program', () => {
      const registerHeadDTO: RegisterDTO = {
        email: 'head@gmail.com',
        name: 'Test Head',
        password: 'passwordhead',
        role: 'HEAD_STUDY_PROGRAM',
        studyProgramId: studyProgram.id,
      };

      it('should register head study program successfully', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);
        prismaMock.user.create.mockResolvedValue({
          id: 'id',
          ...registerHeadDTO,
        });

        await authService.register(registerHeadDTO);
        expect(prismaMock.user.create).toBeCalledTimes(1);
      });

      it('should throw BadRequest if email already exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue({
          id: 'id',
          ...registerHeadDTO,
        });

        await expect(authService.register(registerHeadDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if study program not exists', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(null);

        await expect(authService.register(registerHeadDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });

    describe('fields checking', () => {
      const registerAlumniDTO: RegisterDTO = {
        email: 'alumni@gmail.com',
        name: 'Test Alumni',
        password: 'passwordalumni',
        role: 'ALUMNI',
        phoneNo: '081234567890',
        address: 'address',
        gender: 'MALE',
        enrollmentYear: 2019,
        graduateYear: 2023,
        studyProgramId: studyProgram.id,
      };

      it('should throw BadRequest if studyProgramId is missing for non admin', async () => {
        const { studyProgramId, ...missingFieldsDTO } = registerAlumniDTO;

        prismaMock.user.findFirst.mockResolvedValue(null);

        await expect(authService.register(missingFieldsDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if some fields are missing for alumni', async () => {
        const {
          phoneNo,
          address,
          gender,
          enrollmentYear,
          graduateYear,
          ...missingFieldsDTO
        } = registerAlumniDTO;

        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.studyProgram.findUnique.mockResolvedValue(studyProgram);

        await expect(authService.register(missingFieldsDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });
  });
});
