import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from './DTO';
import { Alumni, PrismaClient, User } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeepMockProxy } from 'jest-mock-extended';
import { secure } from 'src/common/util/security';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { hash } from 'src/common/util/security';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    profileService = testModule.get<ProfileService>(ProfileService);
  });
  const alumni: Alumni = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    phoneNo: '081283888858',
    address: 'depok',
    gender: 'MALE',
    enrollmentYear: 2021,
    graduateYear: 2025,
    studyProgramId: '1',
    npm: 'npm',
  };
  const user: User = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    email: 'email@email.com',
    password: 'currentPassword',
    name: 'user',
    role: 'ALUMNI',
  };
  const updatedUser: User = {
    id: '287ed51b-df85-43ab-96a3-13bb513e68c5',
    email: 'email@email.com',
    password: '$2b$10$89KoyS3YtlCfSsfHiyZTN.phCa6IguJlUjJXI4L5a3sBnFEZrFiY6',
    name: 'user',
    role: 'ALUMNI',
  };

  const updatedProfile: ProfileDTO = {
    name: 'new name',
    currentPassword: 'currentPassword',
    password: 'newpassword',
    address: 'new depok',
    phoneNo: '081283888859',
    enrollmentYear: 2020,
  };
  const undefinePasswordProfile: ProfileDTO = {
    name: 'new name',
    currentPassword: undefined,
    password: 'newpassword',
    address: 'new depok',
    phoneNo: '081283888859',
    enrollmentYear: 2020,
  };
  const undefinePasswordetcProfile: ProfileDTO = {
    name: 'new name',
    currentPassword: undefined,
    password: undefined,
    address: undefined,
    phoneNo: undefined,
    enrollmentYear: 2020,
  };

  describe('edit', () => {
    it('should update profile', async () => {
      const hashedPassword = await hash('currentPassword');
      user.password = hashedPassword;
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.update.mockResolvedValue(user);

      expect(await profileService.edit(updatedProfile, user.email)).toEqual(
        updatedUser,
      );
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });
    it('should return NotFoundException if user is not found', async () => {
      prismaMock.studyProgram.findUnique.mockResolvedValue(null);
      await expect(
        profileService.edit(updatedProfile, user.email),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
    });
    it('should throw BadRequestException if current password or and password is not provided', async () => {
      const hashedPassword = await hash('currentPassword');
      user.password = hashedPassword;
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.update.mockResolvedValue(user);

      await expect(
        profileService.edit(undefinePasswordProfile, user.email),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
    });
    it('should throw BadRequestException if current password field is invalid', async () => {
      const hashedPassword = await hash('invalidPassword');
      user.password = hashedPassword;
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.update.mockResolvedValue(user);

      await expect(
        profileService.edit(updatedProfile, user.email),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
    });
    it('should not hash password and secure phoneNo and address if undefined', async () => {
      const hashedPassword = await hash('currentPassword');
      user.password = hashedPassword;
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.update.mockResolvedValue(user);

      expect(
        await profileService.edit(undefinePasswordetcProfile, user.email),
      ).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProfilebyEmail', () => {
    it('should return user profile with decrypted phoneNo and address if they exist', async () => {
      const alumniUser = {
        name: 'limbat',
        password: 'password',
        alumni: {
          phoneNo: '0818288888888',
          address: 'depok',
          enrollmentYear: 2020,
        },
      };
      const securedPhoneNo = await secure(alumniUser.alumni.phoneNo);
      const securedAddress = await secure(alumniUser.alumni.address);
      alumniUser.alumni.phoneNo = securedPhoneNo;
      alumniUser.alumni.address = securedAddress;
      const findUniqueMock = jest.fn().mockResolvedValue(alumniUser);
      const profileService = new ProfileService({
        user: { findUnique: findUniqueMock },
      } as any);

      expect(await profileService.getProfilebyEmail(user.email)).toEqual({
        name: 'limbat',
        alumni: {
          address: 'depok',
          enrollmentYear: 2020,
          phoneNo: '0818288888888',
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const findUniqueMock = jest.fn().mockResolvedValue(null);
      const profileService = new ProfileService({
        user: { findUnique: findUniqueMock },
      } as any);

      await expect(
        profileService.getProfilebyEmail('nonexistent@example.com'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException if alumni is not found', async () => {
      const mockUser = {
        name: 'John Doe',
        alumni: null,
      };

      const findUniqueMock = jest.fn().mockResolvedValue(mockUser);
      const profileService = new ProfileService({
        user: { findUnique: findUniqueMock },
      } as any);

      await expect(
        profileService.getProfilebyEmail('test@example.com'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
