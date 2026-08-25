import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    BooksModule,
    LoansModule,
  ],
})
export class AppModule {}
