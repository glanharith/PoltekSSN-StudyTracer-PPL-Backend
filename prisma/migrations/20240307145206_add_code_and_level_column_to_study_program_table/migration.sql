-- CreateEnum
CREATE TYPE "StudyProgramLevel" AS ENUM ('D3', 'D4');

-- AlterTable
ALTER TABLE "StudyProgram" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "level" "StudyProgramLevel" NOT NULL DEFAULT 'D3';
