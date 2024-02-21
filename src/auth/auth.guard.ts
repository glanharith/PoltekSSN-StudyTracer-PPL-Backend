import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY, ROLE_KEYS } from 'src/common/decorator/constants';
import { RequestUser } from 'src/common/decorator/interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.getMetadataStatus(context, IS_PUBLIC_KEY);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const user: RequestUser = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const roleAuthorization = ROLE_KEYS.some(({ key }) =>
        this.getMetadataStatus(context, key),
      );
      const roleAuthorized = ROLE_KEYS.reduce<boolean>(
        (prev, { key, value }) => {
          if (this.getMetadataStatus(context, key)) {
            if (user.role === value) return true;
          }

          return prev;
        },
        false,
      );

      if (roleAuthorization && !roleAuthorized) {
        return false;
      }

      request['user'] = user;
    } catch (e: any) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getMetadataStatus(context: ExecutionContext, metadata: string) {
    return this.reflector.getAllAndOverride<boolean>(metadata, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
