import { Module } from '@nestjs/common';
import { ZxcvbnService } from './zxcvbn.service';

@Module({
  providers: [ZxcvbnService],
})
export class ZxcvbnModule {}
