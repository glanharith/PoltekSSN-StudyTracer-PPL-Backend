import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateFormActivityStatus() {
    this.logger.log('Updating form activity status');
    const now = new Date();

    await this.prisma.form.updateMany({
      where: {
        isActive: false,
        startTime: { lte: now },
        endTime: { gte: now },
        lastUpdate: null
      },
      data: { isActive: true }
    });

    const formsToDeactivate = await this.prisma.form.findMany({
      where: {
        isActive: true,
        endTime: { lt: now }
      }
    });

    if (Array.isArray(formsToDeactivate)){
      for (const form of formsToDeactivate) {
        if (!form.lastUpdate || form.lastUpdate < form.endTime) {
          await this.prisma.form.update({
            where: { id: form.id },
            data: { isActive: false }
          });
        }
      }
    }
  }
}
