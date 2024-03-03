import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './DTO';

jest.mock('./auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authServiceMock = module.get<jest.Mocked<AuthService>>(AuthService);
  });

  describe('GET /auth/register', () => {
    const registerAdminDTO: RegisterDTO = {
      email: 'admin@gmail.com',
      name: 'Test Admin',
      password: 'passwordadmin',
      role: 'ADMIN',
    };

    it('should return success message', async () => {
      authServiceMock.register.mockResolvedValue();

      const result = await authController.register(registerAdminDTO);

      expect(result).toEqual({ message: 'Successfully registered' });
    });
  });

  describe('GET /auth/login', () => {
    const loginDTO: LoginDTO = {
      email: 'admin@gmail.com',
      password: 'passwordadmin',
    };

    it('should return token', async () => {
      const token = 'token';
      authServiceMock.login.mockResolvedValue('token');

      const result = await authController.login(loginDTO);

      expect(result).toEqual({ message: 'Successfully logged in', token });
    });
  });
});
