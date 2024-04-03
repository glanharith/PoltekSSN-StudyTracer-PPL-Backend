import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { DeepMockProxy } from 'jest-mock-extended';

jest.mock('src/zxcvbn/zxcvbn.service');
describe('NotificationService', () => {
  let notifService: NotificationService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    notifService = testModule.get<NotificationService>(NotificationService);
  });

  describe('getNotification', () => {
    it('should return notification with filled and unfilled surveys', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const allSurvey = [
        { id: 1, title: 'Survey 1' },
        { id: 2, title: 'Survey 2' },
      ];
      const userResponse = [{ formId: 1, alumniId: 1 }];

      const findUniqueMock = jest.fn().mockResolvedValue(user);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse },
      } as any);
      const result = await notificationService.getNotification(user.email);

      expect(result).toEqual({
        filledSurveys: [{ id: 1, title: 'Survey 1' }],
        unfilledSurveys: [{ id: 2, title: 'Survey 2' }],
        notifications: [
          {
            surveyId: 2,
            message: 'Anda memiliki survei "Survey 2" yang belum diisi.',
          },
        ],
      });
    });

    it('should return empty notification if user has filled all surveys', async () => {
      const userEmail = 'test@example.com';
      const user = { id: 1 };
      const allSurvey = [{ id: 1, title: 'Survey 1' }];
      const userResponse = [{ formId: 1 }];

      const findUniqueMock = jest.fn().mockResolvedValue(user);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse },
      } as any);

      const result = await notificationService.getNotification(userEmail);

      expect(result).toEqual({
        filledSurveys: [{ id: 1, title: 'Survey 1' }],
        unfilledSurveys: [],
        notifications: [],
      });
    });
    it('should return empty result if user id is null', async () => {
      const userEmail = 'test@example.com';
      const allSurvey = [];
      const userResponse = [];

      const findUniqueMock = jest.fn().mockResolvedValue(null);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse },
      } as any);

      const result = await notificationService.getNotification(userEmail);

      expect(result).toEqual({
        filledSurveys: [],
        unfilledSurveys: [],
        notifications: [],
      });
    });
  });
});
