import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { hash, secure, unsecure } from 'src/common/util/security';

jest.mock('src/common/util/security');

describe('ProfileService', () => {
  let profileService: ProfileService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    profileService = new ProfileService(prismaService);
  });

  describe('edit', () => {
    it('should update profile data with hashed password and secured phoneNo and address if they exist', async () => {
      // Mocking PrismaService user update method
      prismaService.user.update = jest.fn().mockResolvedValue({});

      // Mocking hash, secure, and unsecure functions
      (hash as jest.Mock).mockResolvedValue('hashedPassword');
      (secure as jest.Mock).mockImplementation((value) =>
        Promise.resolve('secured' + value),
      );

      const result = await profileService.edit(
        {
          name: 'John Doe',
          password: 'password123',
          phoneNo: '123456789',
          address: '123 Main St',
          enrollmentYear: 2020,
        },
        'test@example.com',
      );

      expect(result).toEqual({});
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: {
          name: 'John Doe',
          password: 'hashedPassword',
          alumni: {
            update: {
              phoneNo: 'secured123456789',
              address: 'secured123 Main St',
              enrollmentYear: 2020,
            },
          },
        },
      });
    });

    it('should update profile data with hashed password and undefined phoneNo and address if they are null or undefined', async () => {
      // Mocking PrismaService user update method
      prismaService.user.update = jest.fn().mockResolvedValue({});

      // Mocking hash function
      (hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await profileService.edit(
        {
          name: 'John Doe',
          password: 'password123',
          phoneNo: undefined,
          address: undefined,
          enrollmentYear: 2020,
        },
        'test@example.com',
      );

      expect(result).toEqual({});
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: {
          name: 'John Doe',
          password: 'hashedPassword',
          alumni: {
            update: {
              phoneNo: undefined,
              address: undefined,
              enrollmentYear: 2020,
            },
          },
        },
      });
    });

    // Add more test cases to cover other scenarios if necessary
  });

  describe('getProfilebyEmail', () => {
    it('should return user profile with decrypted phoneNo and address if they exist', async () => {
      const mockUser = {
        name: 'John Doe',
        alumni: {
          phoneNo: 'securedPhoneNoValue',
          address: 'securedAddressValue',
          enrollmentYear: 2020,
        },
      };

      const findUniqueMock = jest.fn().mockResolvedValue(mockUser);
      const profileService = new ProfileService({
        user: { findUnique: findUniqueMock },
      } as any);
      (unsecure as jest.Mock)
        .mockResolvedValueOnce('unsecuredPhoneNoValue')
        .mockResolvedValueOnce('unsecuredAddressValue');

      const result = await profileService.getProfilebyEmail('test@example.com');

      expect(result).toEqual({
        name: 'John Doe',
        alumni: {
          phoneNo: 'unsecuredPhoneNoValue',
          address: 'unsecuredAddressValue',
          enrollmentYear: 2020,
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

    it('should return user profile with phoneNo and address as undefined if they do not exist in the alumni object', async () => {
      const mockUser = {
        name: 'John Doe',
        alumni: {
          enrollmentYear: 2020,
        },
      };

      const findUniqueMock = jest.fn().mockResolvedValue(mockUser);
      const profileService = new ProfileService({
        user: { findUnique: findUniqueMock },
      } as any);

      const result = await profileService.getProfilebyEmail('test@example.com');

      expect(result).toEqual({
        name: 'John Doe',
        alumni: {
          phoneNo: undefined,
          address: undefined,
          enrollmentYear: 2020,
        },
      });
    });
  });
});
