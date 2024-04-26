import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();

    if (status >= 500) {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }
}
