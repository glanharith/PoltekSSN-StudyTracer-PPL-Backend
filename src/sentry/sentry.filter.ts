import {
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    let status = 500; // Default to 500 for non-HttpException errors

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    if (status >= 500) {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }
}
