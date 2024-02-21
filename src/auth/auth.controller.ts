import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { IsPublic } from 'src/common/decorator/isPublic';
import { LoginDTO, RegisterDTO } from './DTO';
import { response } from 'src/common/util/response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @IsPublic()
  @Post('/register')
  async register(@Body() registerDTO: RegisterDTO) {
    await this.authService.register(registerDTO);

    return response('Successfully registered');
  }

  @IsPublic()
  @Post('/login')
  async login(@Body() loginDTO: LoginDTO) {
    const token = await this.authService.login(loginDTO);

    return response('Successfully logged in', { token });
  }

  @Get('/protected')
  async protected() {
    return response('Authenticated');
  }
}
