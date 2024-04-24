import { Role } from "@prisma/client";
import { AlumniListController } from "./alumni-list.controller";
import {AlumniListService} from './alumni-list.service'
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./alumni-list.service');
describe('AlumniListController',()=>{
    let alumnilistController: AlumniListController
    let alumnilistServiceMock: jest.Mocked<AlumniListService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          controllers: [AlumniListController],
          providers: [AlumniListService],
        }).compile();
    
        alumnilistController = module.get<AlumniListController>(AlumniListController);
        alumnilistServiceMock =
          module.get<jest.Mocked<AlumniListService>>(AlumniListService);
      });
     describe('GET /alumni', () => {
        it('should return all alumni when user is ADMIN', async () => {
            const mockUser = { role: 'ADMIN'};
            alumnilistServiceMock.getAllAlumni.mockResolvedValueOnce([{ name: 'John', email: 'john@example.com' }])
            const result = await alumnilistController.viewAlumni(mockUser);
        
            expect(result).toEqual({
              message: 'Successfully got all the alumnis',
              data: [{ name: 'John', email: 'john@example.com' }]
            });
        });
        it('should return all alumni when user is HEAD OF STUDYPROGRAM', async () => {
            const mockUser = { role: 'HEAD_STUDY_PROGRAM', email: 'example@program.com' };
            alumnilistServiceMock.getAllAlumnibyProdi.mockResolvedValueOnce([{ name: 'Jane', email: 'jane@example.com' }])
            const result = await alumnilistController.viewAlumni(mockUser);
        
            expect(result).toEqual({
              message: 'Successfully got all the alumnis',
              data: [{ name: 'Jane', email: 'jane@example.com' }]
            });
        });
     })

})