import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { prismaServiceMock } from './prisma/prisma.service.mock';
import { NotFoundException } from '@nestjs/common';

describe('AppController', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('getUserById', () => {
    it('should return user info if user exists', async () => {
      const USER = {
        id: 'user1',
        email: 'user1@gmail.com',
        namme: 'Test User 1',
      };
      prismaServiceMock.user.findUnique.mockResolvedValue(USER);

      expect(await appService.getUserById(USER.id)).toEqual(USER);
    });

    it('should return NotFoundException if user not exists', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(appService.getUserById('user2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
