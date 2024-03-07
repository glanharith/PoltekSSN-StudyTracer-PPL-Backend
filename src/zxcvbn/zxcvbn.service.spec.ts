import { Test, TestingModule } from '@nestjs/testing';
import { ZxcvbnService } from './zxcvbn.service';
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';

jest.mock('@zxcvbn-ts/core', () => ({
  ...jest.requireActual('@zxcvbn-ts/core'),
  zxcvbnAsync: jest.fn(),
  zxcvbnOptions: {
    addMatcher: jest.fn(),
    setOptions: jest.fn(),
  },
}));

describe('ZxcvbnService', () => {
  let service: ZxcvbnService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZxcvbnService],
    }).compile();

    service = module.get<ZxcvbnService>(ZxcvbnService);
  });

  describe('onModuleInit', () => {
    it('should set up zxcvbnOptions with custom options', () => {
      service.onApplicationBootstrap();

      expect(zxcvbnOptions.addMatcher).toHaveBeenCalledWith(
        'pwned',
        expect.any(Object),
      );

      expect(zxcvbnOptions.setOptions).toHaveBeenCalledWith({
        translations: expect.any(Object),
        graphs: expect.any(Object),
        dictionary: expect.any(Object),
      });
    });
  });

  describe('getScore', () => {
    it('should return the score from zxcvbnAsync', async () => {
      const password = 'testPassword';
      (zxcvbnAsync as jest.Mock).mockResolvedValue({ score: 3 });

      const result = await service.getScore(password);

      expect(result).toBe(3);
      expect(zxcvbnAsync).toHaveBeenCalledWith(password);
    });
  });
});
