import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { DeepMockProxy } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';

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
      const user = { id: 1, email: 'test@example.com' ,alumni: { enrollmentYear: 2015, graduateYear: 2019 }};
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
      const user = { id: 1, email: 'test@example.com' ,alumni: { enrollmentYear: 2015, graduateYear: 2019 }};
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

      const result = await notificationService.getNotification(user.email);

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
    it('should filter eligible forms based on admission and graduate years', async () => {
      const userEmail = 'test@example.com';
      const user = { id: 1, alumni: { enrollmentYear: 2015, graduateYear: 2019 } };
      const allSurvey = [
        { id: 1, title: 'Survey 1', admissionYearFrom: 2014, admissionYearTo: 2016, graduateYearFrom: 2018, graduateYearTo: 2020 },
        { id: 2, title: 'Survey 2', admissionYearFrom: 2016, admissionYearTo: 2018, graduateYearFrom: 2019, graduateYearTo: 2021 },
        { id: 3, title: 'Survey 3', admissionYearFrom: null, admissionYearTo: null, graduateYearFrom: null, graduateYearTo: null },
      
      ];
      const userResponse = [
        {formId:'1'}
      ]
    
      const findUniqueMock = jest.fn().mockResolvedValue(user);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse }, // Provide mock for response.findMany
      } as any);
    
      const result = await notificationService.getNotification(userEmail);
    
      expect(findManyMockForm).toHaveBeenCalledTimes(1);
      expect(findManyMockForm.mock.calls[0][0].where).toEqual({
        startTime: expect.any(Object), 
        endTime: expect.any(Object),   
      });
    });
    it('should handle null alumni property', async () => {
      const userEmail = 'test@example.com';
      const user = { id: 1, alumni: null };
      const allSurvey = [
        { id: 1, title: 'Survey 1', admissionYearFrom: 2014, admissionYearTo: 2016, graduateYearFrom: 2018, graduateYearTo: 2020 },
        { id: 2, title: 'Survey 2', admissionYearFrom: 2016, admissionYearTo: 2018, graduateYearFrom: 2019, graduateYearTo: 2021 },
        { id: 3, title: 'Survey 3', admissionYearFrom: null, admissionYearTo: null, graduateYearFrom: null, graduateYearTo: null },
      ];
      const userResponse = [
        {formId:'1'}
      ];
    
      const findUniqueMock = jest.fn().mockResolvedValue(user);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse },
      } as any);
    
      await expect(
        notificationService.getNotification('test@example.com'),
      ).rejects.toThrowError(NotFoundException);
    });
    it('should handle null user property', async () => {
      const userEmail = 'test@example.com';
      const user = null;
      const allSurvey = [
        { id: 1, title: 'Survey 1', admissionYearFrom: 2014, admissionYearTo: 2016, graduateYearFrom: 2018, graduateYearTo: 2020 },
        { id: 2, title: 'Survey 2', admissionYearFrom: 2016, admissionYearTo: 2018, graduateYearFrom: 2019, graduateYearTo: 2021 },
        { id: 3, title: 'Survey 3', admissionYearFrom: null, admissionYearTo: null, graduateYearFrom: null, graduateYearTo: null },
      ];
      const userResponse = [
        {formId:'1'}
      ];
    
      const findUniqueMock = jest.fn().mockResolvedValue(user);
      const findManyMockForm = jest.fn().mockResolvedValue(allSurvey);
      const findManyMockResponse = jest.fn().mockResolvedValue(userResponse);
      const notificationService = new NotificationService({
        user: { findUnique: findUniqueMock },
        form: { findMany: findManyMockForm },
        response: { findMany: findManyMockResponse },
      } as any);
    
      await expect(
        notificationService.getNotification('test@example.com'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
