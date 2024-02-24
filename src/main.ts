import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const https = process.env.APP_OPEN_HTTPS;
  const httpsOptions = https
    ? {
        key: fs.readFileSync(process.env.APP_KEY!),
        cert: fs.readFileSync(process.env.APP_CERT!),
      }
    : {};
  const app = await NestFactory.create(
    AppModule,
    https ? { httpsOptions } : {},
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.APP_ALLOWED_ORIGIN,
    credentials: true,
  });

  const APP_PORT = https ? 443 : process.env.APP_PORT;
  await app.listen(APP_PORT ?? 3000);

  Logger.log(`Listening on ${await app.getUrl()}`);
}
bootstrap();
