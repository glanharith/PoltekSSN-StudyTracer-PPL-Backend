import { Role } from '@prisma/client';

export interface RequestUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
  iat: number;
  exp: number;
}
