import { Module } from '@nestjs/common';
import { ZxcvbnService } from './zxcvbn.service';

@Module({
  providers: [ZxcvbnService],
  exports: [ZxcvbnService],
})
export class ZxcvbnModule {}
