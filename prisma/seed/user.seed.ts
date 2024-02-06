import { PrismaClient } from '@prisma/client';

export const userSeed = async (prisma: PrismaClient) => {
  await prisma.user.upsert({
    where: {
      username: 'alice',
    },
    update: {},
    create: {
      username: 'alice',
      name: 'Alice',
    },
  });

  await prisma.user.upsert({
    where: {
      username: 'bob',
    },
    update: {},
    create: {
      username: 'bob',
      name: 'Bob',
    },
  });
};
