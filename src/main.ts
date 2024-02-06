import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const APP_PORT = process.env.APP_PORT ?? 3000;
  await app.listen(APP_PORT);

  Logger.log(`Listening on ${await app.getUrl()}`);
}
bootstrap();
