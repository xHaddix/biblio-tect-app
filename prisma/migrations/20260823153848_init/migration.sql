-- AlterTable
ALTER TABLE "books" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "book_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_categories_name_key" ON "book_categories"("name");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "book_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
