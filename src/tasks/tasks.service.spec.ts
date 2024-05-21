import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { PrismaClient, FormType } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

describe('TasksService', () => {
  let service: TasksService;
  let prismaMock: DeepMockProxy<PrismaClient>;;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: { form: prismaMock.form },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaMock).toBeDefined();
  });

  describe('updateFormActivityStatus', () => {
    it('should activate eligible forms', async () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      await service.updateFormActivityStatus();

      expect(prismaMock.form.updateMany).toHaveBeenCalledWith({
        where: {
          isActive: false,
          startTime: { lte: now },
          endTime: { gte: now },
          lastUpdate: null
        },
        data: { isActive: true }
      });
    });

    it('should deactivate forms where lastUpdate is null or before endTime', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);
      const oneHourFromNow = new Date(now.getTime() + 3600000);
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      const mockForms = [
        {
          id: '1',
          type: FormType.CURRICULUM,
          title: 'Form 1',
          description: 'Description for Form 1',
          startTime: twoHoursAgo,
          endTime: oneHourAgo,
          isActive: true,
          lastUpdate: null,
          admissionYearFrom: 2020,
          admissionYearTo: 2023,
          graduateYearFrom: 2024,
          graduateYearTo: 2027
        },
        {
          id: '2',
          type: FormType.CURRICULUM,
          title: 'Form 2',
          description: 'Description for Form 2',
          startTime: twoHoursAgo,
          endTime: now,
          isActive: true,
          lastUpdate: oneHourAgo,
          admissionYearFrom: 2020,
          admissionYearTo: 2023,
          graduateYearFrom: 2024,
          graduateYearTo: 2027
        },
      ];

      prismaMock.form.findMany.mockResolvedValue(mockForms);

      await service.updateFormActivityStatus();

      expect(prismaMock.form.update).toHaveBeenCalledTimes(2);
      expect(prismaMock.form.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false }
      });
      expect(prismaMock.form.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: { isActive: false }
      });
    });

    it('should not activate any forms if none are eligible', async () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      prismaMock.form.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.updateFormActivityStatus()).resolves.not.toThrow(); // Check the method does not throw

      expect(prismaMock.form.updateMany).toHaveBeenCalledWith({
        where: {
          isActive: false,
          startTime: { lte: now },
          endTime: { gte: now },
          lastUpdate: null
        },
        data: { isActive: true }
      });

      expect(prismaMock.form.updateMany).toHaveBeenLastCalledWith({
        where: {
          isActive: false,
          startTime: { lte: now },
          endTime: { gte: now },
          lastUpdate: null
        },
        data: { isActive: true }
      });

      await expect(prismaMock.form.updateMany.mock.results[0].value).resolves.toEqual({ count: 0 });
    });

    it('should not deactivate any forms if none are past endTime', async () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      prismaMock.form.findMany.mockResolvedValue([]);

      await service.updateFormActivityStatus();

      expect(prismaMock.form.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          endTime: { lt: now }
        }
      });
      expect(prismaMock.form.update).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
