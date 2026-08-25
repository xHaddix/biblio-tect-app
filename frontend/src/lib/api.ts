/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Helper para extraer mensajes de error de NestJS / Swagger
export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const msg = error.response.data.message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return fallback;
};
