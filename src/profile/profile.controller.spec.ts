import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileDTO } from './DTO';
import { User, Alumni } from '@prisma/client';

jest.mock('./profile.service');

describe('ProfileController', () => {
    let profileController: ProfileController;
    let profileServiceMock: jest.Mocked<ProfileService>;
  
    beforeEach(async () => {
      const profile: TestingModule = await Test.createTestingModule({
        controllers: [ProfileController],
        providers: [ProfileService],
      }).compile();
  
      profileController = profile.get<ProfileController>(
        ProfileController,
      );
      profileServiceMock =
        profile.get<jest.Mocked<ProfileService>>(ProfileService);
    });

  describe('GET /profile', () => {
    const user: User = {
      id: '1',
      email: 'user1@gmail.com',
      password: 'user1Password',
      name: 'user1',
      role: 'ALUMNI'
    }
    const alumni: Alumni = {
      id: '1',
      phoneNo: '081283843155',
      address: 'Depok',
      gender: 'MALE',
      enrollmentYear: 2021,
      graduateYear: 2024,
      studyProgramId: 'studyprogram1'
    }
    it('should return profile data', async () => {
        profileServiceMock.getProfilebyId.mockResolvedValue({email:user.email});
        const result = await profileController.viewProfile(alumni);
        expect(result).toEqual({message:'Succesfully return profile data', data:alumni})
    });
  });
})
