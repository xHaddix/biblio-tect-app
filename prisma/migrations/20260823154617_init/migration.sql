/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `book_categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "book_categories" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;
