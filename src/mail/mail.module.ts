import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

@Module({
  providers: [MailService, MailerService],
  exports: [MailService],
})
export class MailModule {}
