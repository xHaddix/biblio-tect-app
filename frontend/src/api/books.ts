/* eslint-disable @typescript-eslint/no-unsafe-return */
import { api } from '../lib/api';
import type { Book, BookCategory } from '../types';

export const booksApi = {
  getAll: async () => {
    const response = await api.get<Book[]>('/books');
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get<BookCategory[]>('/books/categories');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post<Book>('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string, formData: FormData) => {
    const response = await api.patch<Book>(`/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
  deleteImage: async (id: string) => {
    const response = await api.delete(`/books/${id}/image`);
    return response.data;
  },
};
