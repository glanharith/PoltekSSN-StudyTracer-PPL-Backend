import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, RegisterDTO } from './DTO';
import { PrismaClient, StudyProgram } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy } from 'jest-mock-extended';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { hash } from 'src/common/util/security';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';

jest.mock('src/zxcvbn/zxcvbn.service');

describe('AuthService', () => {
  let authService: AuthService;
  let zxcvbnService: jest.Mocked<ZxcvbnService>;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRY },
        }),
        ZxcvbnModule,
      ],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    zxcvbnService = module.get<jest.Mocked<ZxcvbnService>>(ZxcvbnService);
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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

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
        zxcvbnService.getScore.mockResolvedValue(5);

        await expect(authService.register(missingFieldsDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });

      it('should throw BadRequest if password not strong enough', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        zxcvbnService.getScore.mockResolvedValue(2);

        await expect(authService.register(registerAlumniDTO)).rejects.toThrow(
          BadRequestException,
        );
        expect(prismaMock.user.create).toBeCalledTimes(0);
      });
    });
  });

  describe('login', () => {
    const adminUser: RegisterDTO = {
      email: 'admin@gmail.com',
      name: 'Test Admin',
      password: 'passwordadmin',
      role: 'ADMIN',
    };

    const loginDTO: LoginDTO = {
      email: 'admin@gmail.com',
      password: 'passwordadmin',
    };

    it('should login user successfully', async () => {
      const hashedPassword = await hash(adminUser.password);
      prismaMock.user.findFirst.mockResolvedValue({
        ...adminUser,
        id: 'id',
        password: hashedPassword,
      });

      const result = await authService.login(loginDTO);
      expect(result).toEqual(expect.any(String));
    });

    it('should throw BadRequest if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(authService.login(loginDTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if password incorrect', async () => {
      const wrongPasswordDTO = { ...loginDTO, password: 'wrongpassword' };
      const hashedPassword = await hash(adminUser.password);
      prismaMock.user.findFirst.mockResolvedValue({
        ...adminUser,
        id: 'id',
        password: hashedPassword,
      });

      await expect(authService.login(wrongPasswordDTO)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
