import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('AppService', () => {
  let appService: AppService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService, PrismaService],
    }).compile();

    appService = app.get<AppService>(AppService);
    prismaService = app.get<PrismaService>(PrismaService);
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

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      expect(await appService.getUserById(user.id)).toEqual(user);
    });

    it('should return NotFoundException if user not exists', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(appService.getUserById('user2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
