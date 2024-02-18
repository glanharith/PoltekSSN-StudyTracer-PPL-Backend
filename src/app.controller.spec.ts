import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appServiceMock = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('/hello/:id', () => {
    it('should return user info', async () => {
      const USER = {
        id: 'user1',
        email: 'user1@gmail.com',
        namme: 'Test User 1',
      };
      appServiceMock.getUserById.mockResolvedValue(USER);

      expect(await appController.getUserById(USER.id)).toEqual({ user: USER });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
