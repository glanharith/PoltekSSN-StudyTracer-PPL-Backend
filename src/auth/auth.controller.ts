import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from 'src/common/decorator';
import { LoginDTO, RegisterDTO } from './DTO';
import { response } from 'src/common/util/response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
