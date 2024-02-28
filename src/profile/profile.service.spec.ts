import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import {Alumni, User} from '@prisma/client'
import { hash, unsecure } from '../common/util/security';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { from } from 'rxjs';

describe('ProfileService', () => {
    let profileService: ProfileService;
    let prismaMock: DeepMockProxy<PrismaClient>;
    const profileUser: User = {
      id: '1',
      email: 'user@gmail.com',
      password: 'user1Password',
      name: 'User1',
      role: 'ALUMNI'
    };
  
    beforeEach(async () => {
      prismaMock = createPrismaMock();
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileService,
          { provide: PrismaService, useValue: prismaMock },
        ],
      }).compile();
  
      profileService = module.get<ProfileService>(ProfileService);
    });
  
    describe('getProfilebyId', () => {
      it('should return profile data', async () => {
        prismaMock.user.findUnique.mockResolvedValue(profileUser);
        await expect(profileService.getProfilebyId(profileUser.email)).resolves.not.toThrow(NotFoundException);
      });
  
      it('should throw NotFoundException if user not found', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        await expect(profileService.getProfilebyId(profileUser.email)).rejects.toThrow(NotFoundException);
      });
    });
  });
  