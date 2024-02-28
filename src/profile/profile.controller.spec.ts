import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileDTO } from './DTO';

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

  const email = 'user@gmail.com';
  const profileData = { email: email, otherField: 'otherData' };
  const profileDTO: ProfileDTO = {
    name: 'user1',
    password: 'user123'
  } 

  describe('GET /profile', () => {

    it('should return profile data', async () => {

      profileServiceMock.getProfilebyEmail.mockResolvedValue(profileData);

      const result = await profileController.viewProfile({ user: { email: email } });

      expect(result).toEqual({ message: 'Successfully got all profile information', data: profileData });
    });
  });

  describe('UPDATE /profile', () => {
    it('should update profile data', async () => {
      profileServiceMock.edit.mockResolvedValue(profileData);
      const result = await profileController.editProfile({ user: { email: email } }, profileDTO);
      expect(result).toEqual({message:'Successfully update profile information'})
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

});
