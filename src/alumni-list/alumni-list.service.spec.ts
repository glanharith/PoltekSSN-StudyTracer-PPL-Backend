import { DeepMockProxy } from "jest-mock-extended";
import { AlumniListService } from "./alumni-list.service";
import { PrismaClient } from "@prisma/client";
import { createPrismaMock } from 'src/prisma/prisma.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';
import { ZxcvbnService } from 'src/zxcvbn/zxcvbn.service';
import { PrismaService } from '../prisma/prisma.service';
import { secure } from 'src/common/util/security';
import { NotFoundException } from "@nestjs/common";

describe('AlumniListService', () => {
    let alumnilistService: AlumniListService;
    let prismaMock: DeepMockProxy<PrismaClient>;
    let zxcvbnService: jest.Mocked<ZxcvbnService>;

    beforeEach(async () => {
        prismaMock = createPrismaMock();
        const testModule: TestingModule = await Test.createTestingModule({
            imports: [ZxcvbnModule],
            providers: [
                AlumniListService,
                { provide: PrismaService, useValue: prismaMock },
                { provide: ZxcvbnService, useValue: { estimate: jest.fn() } },
            ],
        }).compile();

        alumnilistService = testModule.get<AlumniListService>(AlumniListService);
        zxcvbnService = testModule.get<jest.Mocked<ZxcvbnService>>(ZxcvbnService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all alumni', async () => {
        const alumniUser = [{
            name: 'limbat',
            email: 'email@email.com',
            alumni: {
                npm: '2106752344',
                phoneNo: '081283831838',
                address: 'depok',
                gender: 'MALE',
                enrollmentYear: 2021,
                graduateYear: 2025
            }
        }]
        const securedPhone = await secure(alumniUser[0].alumni.phoneNo)
        const securedAddress = await secure(alumniUser[0].alumni.address)
        const securedEmail = await secure(alumniUser[0].email)
        alumniUser[0].alumni.phoneNo = securedPhone
        alumniUser[0].alumni.address = securedAddress
        alumniUser[0].email = securedEmail
        const findManyMock = jest.fn().mockResolvedValue(alumniUser);
        const alumnilistService = new AlumniListService(
            {
              user: { findMany: findManyMock },
            } as any,
        );

        const result = await alumnilistService.getAllAlumni();

        expect(result).toHaveLength(1);
        expect(result[0].name).toEqual('limbat');
        expect(result[0].email).toEqual('email@email.com');
        expect(result[0].alumni.address).toEqual('depok');
        expect(result[0].alumni.phoneNo).toEqual('081283831838');
        expect(result[0].alumni.npm).toEqual('2106752344');
        expect(result[0].alumni.gender).toEqual('MALE');
        expect(result[0].alumni.enrollmentYear).toEqual(2021);
        expect(result[0].alumni.graduateYear).toEqual(2025);
    });
     it('should get all alumni', async () => {
        const alumniUser = [{
            name: 'limbat',
            email: 'email@email.com',
            alumni: {
                npm: '2106752344',
                phoneNo: '081283831838',
                address: 'depok',
                gender: 'MALE',
                enrollmentYear: 2021,
                graduateYear: 2025
            }
        }]
        const securedPhone = await secure(alumniUser[0].alumni.phoneNo)
        const securedAddress = await secure(alumniUser[0].alumni.address)
        const securedEmail = await secure(alumniUser[0].email)
        alumniUser[0].alumni.phoneNo = securedPhone
        alumniUser[0].alumni.address = securedAddress
        alumniUser[0].email = securedEmail
        const findManyMock = jest.fn().mockResolvedValue(alumniUser);
        const alumnilistService = new AlumniListService(
            {
              user: { findMany: findManyMock },
            } as any,
        );

        const result = await alumnilistService.getAllAlumni();

        expect(result).toHaveLength(1);
        expect(result[0].name).toEqual('limbat');
        expect(result[0].email).toEqual('email@email.com');
        expect(result[0].alumni.address).toEqual('depok');
        expect(result[0].alumni.phoneNo).toEqual('081283831838');
        expect(result[0].alumni.npm).toEqual('2106752344');
        expect(result[0].alumni.gender).toEqual('MALE');
        expect(result[0].alumni.enrollmentYear).toEqual(2021);
        expect(result[0].alumni.graduateYear).toEqual(2025);
    });
    it('should get all alumni by study program', async () => {
        const headEmail = 'head@example.com';
        const headStudyProgramId = 123; 
        const head = {
            email: headEmail,
            headStudyProgram: {
                studyProgramId: headStudyProgramId,
            },
        };
        
        const alumniUser = [{
            name: 'limbat',
            email: 'email@email.com',
            alumni: {
                npm: '2106752344',
                phoneNo: '081283831838',
                address: 'depok',
                gender: 'MALE',
                enrollmentYear: 2021,
                graduateYear: 2025,
                studyProgramId: headStudyProgramId,
            },
        }];
        const securedPhone = await secure(alumniUser[0].alumni.phoneNo)
        const securedAddress = await secure(alumniUser[0].alumni.address)
        const securedEmail = await secure(alumniUser[0].email)
        alumniUser[0].alumni.phoneNo = securedPhone
        alumniUser[0].alumni.address = securedAddress
        alumniUser[0].email = securedEmail
        const findManyMock = jest.fn().mockResolvedValue(alumniUser);
        const findUniqueMock = jest.fn().mockResolvedValue(head)
        const alumnilistService = new AlumniListService(
            {
              user: { findMany: findManyMock,
                findUnique: findUniqueMock
               },
            } as any,
        );
        const result = await alumnilistService.getAllAlumnibyProdi(headEmail);
        expect(result).toHaveLength(1);
        expect(result[0].name).toEqual('limbat');
        expect(result[0].email).toEqual('email@email.com');
        expect(result[0].alumni.address).toEqual('depok');
        expect(result[0].alumni.phoneNo).toEqual('081283831838');
        expect(result[0].alumni.npm).toEqual('2106752344');
        expect(result[0].alumni.gender).toEqual('MALE');
        expect(result[0].alumni.enrollmentYear).toEqual(2021);
        expect(result[0].alumni.graduateYear).toEqual(2025);
    });
    it('should return NotFoundException if head is not found', async () => {
        const findUniqueMock = jest.fn().mockResolvedValue(null);
        const alumnilistService = new AlumniListService(
            {
              user: { findUnique: findUniqueMock },
            } as any,
        );
        await expect(
            alumnilistService.getAllAlumnibyProdi('nonexistent@example.com'),
        ).rejects.toThrowError(NotFoundException);
    })
    it('should return NotFoundException if head.headstudyprogram is not found', async () => {
        const mockUser = {
            name: 'John Doe',
            alumni: null,
        };
        const findUniqueMock = jest.fn().mockResolvedValue(mockUser);
        const alumnilistService = new AlumniListService(
            {
              user: { findUnique: findUniqueMock },
            } as any,
        );
        await expect(
            alumnilistService.getAllAlumnibyProdi('nonexistent@example.com'),
        ).rejects.toThrowError(NotFoundException);
    })
});
