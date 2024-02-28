import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

jest.mock('./profile.service');

describe('ProfileController', () => {
  let profileController: ProfileController;
  let profileServiceMock: jest.Mocked<ProfileService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [ProfileService],
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
    profileServiceMock = module.get<jest.Mocked<ProfileService>>(ProfileService);
  });

  describe('GET /profile', () => {

    it('should return profile data', async () => {
      const email = 'user@gmail.com';
      const profileData = { email: email, otherField: 'otherData' };
      profileServiceMock.getProfilebyId.mockResolvedValue(profileData);

      const result = await profileController.viewProfile({ user: { email: email } });

      expect(result).toEqual({ message: 'Successfully got all profile information', data: profileData });
    });
  });


});
