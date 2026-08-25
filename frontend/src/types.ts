export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: number; // 1: Activo, 0: Inactivo
  createdAt: string;
}

export interface BookCategory {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  totalCopies: number;
  availableCopies: number;
  imageKey?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: BookCategory;
  status: number;
  createdAt: string;
  deletedAt?: string;
}

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  loanDate: string;
  returnDate?: string;
  user?: User;
  book?: Book;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Payload DTOs
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  categoryId?: string;
  image?: File;
}

export interface CreateLoanDto {
  userId: string;
  bookId: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  status?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
