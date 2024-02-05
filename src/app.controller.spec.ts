import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
    prismaService = app.get<PrismaService>(PrismaService);

    await prismaService.user.upsert({
      where: {
        username: 'testuser1',
      },
      update: {},
      create: {
        username: 'testuser1',
        name: 'Test User 1',
      },
    });
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('/hello/:username', () => {
    it('should return "Hello {name}!" if username found', async () => {
      expect(await appController.getUsername('testuser1')).toEqual(
        'Hello Test User 1!',
      );
    });

    it('should return "User not found" if username not found', async () => {
      expect(await appController.getUsername('testuser2')).toEqual(
        'User not found',
      );
    });
  });

  afterAll(async () => {
    await prismaService.user.delete({
      where: {
        username: 'testuser1',
      },
    });
  });
});
