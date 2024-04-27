import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './sentry/sentry.filter';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DNS,
  });
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
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: process.env.APP_ALLOWED_ORIGIN,
    credentials: true,
  });

  const APP_PORT = https ? 443 : process.env.APP_PORT;
  await app.listen(APP_PORT ?? 3000);

  Logger.log(`Listening on ${await app.getUrl()}`);
}
bootstrap();
