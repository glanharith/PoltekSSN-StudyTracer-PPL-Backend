import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('hello/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.appService.getUserById(id);

    return { user };
  }
}
