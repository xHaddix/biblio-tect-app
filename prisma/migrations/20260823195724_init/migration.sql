/*
  Warnings:

  - You are about to drop the column `available` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "available",
ADD COLUMN     "available_copies" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'Español',
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "published_year" INTEGER,
ADD COLUMN     "total_copies" INTEGER NOT NULL DEFAULT 1;
