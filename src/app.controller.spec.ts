import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from '@prisma/client';

jest.mock('./app.service');

describe('AppController', () => {
  let appController: AppController;
  let appServiceMock: jest.Mocked<AppService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appServiceMock = app.get<jest.Mocked<AppService>>(AppService);
  });

  describe('GET /', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('GET /hello/:id', () => {
    it('should return user info', async () => {
      const user: User = {
        id: 'user1',
        email: 'user1@gmail.com',
        password: 'password',
        name: 'Test User 1',
        role: 'ADMIN',
      };
      appServiceMock.getUserById.mockResolvedValue(user);

      expect(await appController.getUserById(user.id)).toEqual({ user: user });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
