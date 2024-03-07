import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ZxcvbnService implements OnModuleInit {
  onModuleInit() {}

  async getScore(password: string): Promise<number> {
    return -1;
  }
}
