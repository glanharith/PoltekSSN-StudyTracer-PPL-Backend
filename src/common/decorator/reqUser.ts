import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from './interface';

export const ReqUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): RequestUser => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
