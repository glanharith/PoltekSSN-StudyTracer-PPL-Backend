import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfStudyProgramController } from './head-of-study-program.controller';
import { HeadOfStudyProgramService } from './head-of-study-program.service';
import { CreateHeadOfStudyProgramDto } from './dto/create-head-of-study-program.dto';
import { StudyProgram } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { UpdateHeadOfStudyProgramDto } from './dto/update-head-of-study-program.dto';

jest.mock('./head-of-study-program.service');

describe('HeadOfStudyProgramController', () => {
  let kaprodiController: HeadOfStudyProgramController;
  let kaprodiServiceMock: jest.Mocked<HeadOfStudyProgramService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadOfStudyProgramController],
      providers: [HeadOfStudyProgramService],
    }).compile();

    kaprodiController = module.get<HeadOfStudyProgramController>(
      HeadOfStudyProgramController,
    );
    kaprodiServiceMock = module.get<jest.Mocked<HeadOfStudyProgramService>>(
      HeadOfStudyProgramService,
    );
  });

  const studyProgram: StudyProgram = {
    id: 'studyprogram2',
    name: 'Study Program 2',
  };

  const registerKaprodiDTO: CreateHeadOfStudyProgramDto = {
    email: 'kaprodi@gmail.com',
    name: 'Test kaprodi',
    password: 'passwordKaprpdi',
    studyProgramId: studyProgram.id,
  };

  // const updateKaprodiDTO: UpdateHeadOfStudyProgramDto = {
    
  // }

  const cleanData = [
    {
      id: 'id',
      name: registerKaprodiDTO.email,
      headStudyProgram: {
        studyProgram: {
          name: studyProgram.name,
        },
      },
      email: registerKaprodiDTO.email,
    },
  ];

  describe('POST /kaprodi', () => {
    it('should create a new head of study program', async () => {
      kaprodiServiceMock.create.mockResolvedValue({
        id: 'id',
        email: 'kaprodi@gmail.com',
        name: 'Test kaprodi',
        password: 'passwordKaprpdi',
        role: 'HEAD_STUDY_PROGRAM',
      });
      const result = await kaprodiController.create(registerKaprodiDTO);

      expect(result).toEqual({
        message: 'Successfully created a new head of study program',
      });
    });
  });

  describe('GET /kaprodi', () => {
    it('should return all head of study programs', async () => {
      kaprodiServiceMock.findAll.mockResolvedValue(cleanData);
      const result = await kaprodiController.findAll();

      expect(result).toEqual(cleanData);
    });

    it('should return no head of study programs', async () => {
      kaprodiServiceMock.findAll.mockResolvedValue([]);
      const result = await kaprodiController.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('DELETE /kaprodi/:id', () => {
    it('should successfully delete a head of study program', async () => {
      const id = 'id';
      kaprodiServiceMock.delete.mockResolvedValue({id, message:"Deleted successfully"});
      const result = await kaprodiController.delete(id);

      expect(result).toEqual({
        id,
        message: 'Deleted successfully',
      });
      
      expect(kaprodiServiceMock.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException for a non-existing head of study program', async () => {
      const id = 'notExist';
      kaprodiServiceMock.delete.mockRejectedValue(new NotFoundException());

      await expect(kaprodiController.delete(id)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during deletion', async () => {
      const id = 'id';
      kaprodiServiceMock.delete.mockRejectedValue(new InternalServerErrorException());;
      
      await expect(kaprodiController.delete(id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // describe('PATCH /kaprodi/:id', () => {
  //   it('should successfully update a head of study program', async () => {
  //     const id = "id";


  //   });

  // });
});
