import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { createPrismaMock } from './prisma/prisma.mock';

describe('AppService', () => {
  let appService: AppService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('getUserById', () => {
    it('should return user info if user exists', async () => {
      const user: User = {
        id: 'user1',
        email: 'user1@gmail.com',
        password: 'password',
        name: 'Test User 1',
        role: 'ADMIN',
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      expect(await appService.getUserById(user.id)).toEqual(user);
    });

    it('should return NotFoundException if user not exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(appService.getUserById('user2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
