import { api } from '../lib/api';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    // Pasar el objeto { email, password } directamente:
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },
};
