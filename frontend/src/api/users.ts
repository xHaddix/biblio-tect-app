import { api } from '../lib/api';
import type { User, CreateUserDto, UpdateUserDto } from '../types';

export const usersApi = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserDto) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  // Reemplazar Partial<CreateUserDto> por UpdateUserDto
  update: async (id: string, data: UpdateUserDto) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  },
};
