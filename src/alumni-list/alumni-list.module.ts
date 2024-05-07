import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';
import { AlumniListService } from './alumni-list.service';
import { AlumniListController } from './alumni-list.controller';

@Module({
  imports: [ZxcvbnModule],
  controllers: [AlumniListController],
  providers: [AlumniListService, PrismaService],
})
export class AlumniListModule {}
