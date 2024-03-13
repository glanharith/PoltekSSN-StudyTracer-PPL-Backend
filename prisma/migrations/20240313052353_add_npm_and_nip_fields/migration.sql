/*
  Warnings:

  - A unique constraint covering the columns `[npm]` on the table `Alumni` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nip]` on the table `HeadStudyProgram` will be added. If there are existing duplicate values, this will fail.
  - The required column `npm` was added to the `Alumni` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `nip` was added to the `HeadStudyProgram` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Alumni" ADD COLUMN "npm" TEXT;

-- AlterTable
ALTER TABLE "HeadStudyProgram" ADD COLUMN "nip" TEXT;

UPDATE "Alumni" SET "npm" = "id";

UPDATE "HeadStudyProgram" SET "nip" = "id";

-- AlterTable
ALTER TABLE "Alumni" ALTER COLUMN "npm" SET NOT NULL;

-- AlterTable
ALTER TABLE "HeadStudyProgram" ALTER COLUMN "nip" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Alumni_npm_key" ON "Alumni"("npm");

-- CreateIndex
CREATE UNIQUE INDEX "HeadStudyProgram_nip_key" ON "HeadStudyProgram"("nip");
