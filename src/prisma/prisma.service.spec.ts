import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect method', async () => {
    const connectSpy = jest.spyOn(service, '$connect');

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('should call $disconnect method', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect');

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
