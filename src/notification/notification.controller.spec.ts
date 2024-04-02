import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

jest.mock('./notification.service');

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<jest.Mocked<NotificationService>>(NotificationService);
  });

  const email = 'user@gmail.com';
  const mockNotification = [{ id: 1, message: 'Notification 1' }];

  describe('GET /notification', () => {
    it('should get notification for alumni', async () => {
      service.getNotification.mockResolvedValue(mockNotification);
      const result = await controller.getNotification({ email });

      expect(result).toEqual({
        message: 'Successfully got all notification',
        data: mockNotification,
      });
    });
  });
});
