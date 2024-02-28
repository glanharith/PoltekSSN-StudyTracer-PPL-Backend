import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import {User} from '@prisma/client'
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { createPrismaMock } from 'src/prisma/prisma.mock';

describe('ProfileService', () => {
    let profileService: ProfileService;
    let prismaMock: DeepMockProxy<PrismaClient>;
    const profileUser: User = {
      id: '10',
      email: 'user@gmail.com',
      password: 'user1Password',
      name: 'User1',
      role: 'ALUMNI'
    };

    const updatedProfileUser: User = {
      id: '17',
      email: profileUser.email,
      password: 'user1Password',
      name: profileUser.name,
      role: 'ALUMNI'
    }
  
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
  
    describe('getProfilebyEmail', () => {
      it('should return profile data', async () => {
        prismaMock.user.findUnique.mockResolvedValue(profileUser);
        await expect(profileService.getProfilebyEmail(profileUser.email)).resolves.not.toThrow(NotFoundException);
      });
  
      it('should throw NotFoundException if user not found', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        await expect(profileService.getProfilebyEmail(profileUser.email)).rejects.toThrow(NotFoundException);
      });
    });

    describe('edit', () => {
      it('should update profile data', async () => {
        prismaMock.user.findUnique.mockResolvedValue(profileUser);
        prismaMock.user.update.mockResolvedValue(updatedProfileUser);
        await expect(profileService.edit(updatedProfileUser, profileUser.email)).resolves.not.toThrow(NotFoundException);
      });
      

    });
  });
  