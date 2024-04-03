import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ZxcvbnModule } from 'src/zxcvbn/zxcvbn.module';

@Module({
  imports: [ZxcvbnModule],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
})
export class NotificationModule {}
