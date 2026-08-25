/* eslint-disable */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'Novela',
    'Ciencia Ficción',
    'Infantil',
    'Romance',
    'Historia',
    'Tecnología',
    'Fantasía',
  ];

  for (const name of categories) {
    await prisma.bookCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
