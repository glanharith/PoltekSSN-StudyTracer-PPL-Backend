import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { IsPublic } from 'src/common/decorator/isPublic';
import { RegisterDTO } from './DTO';
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
}
