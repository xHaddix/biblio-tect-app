import { api } from '../lib/api';
import type { Loan, CreateLoanDto } from '../types';

export const loansApi = {
  getAll: async () => {
    const response = await api.get<Loan[]>('/loans');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Loan>(`/loans/${id}`);
    return response.data;
  },
  create: async (data: CreateLoanDto) => {
    const response = await api.post<Loan>('/loans', data);
    return response.data;
  },
  returnLoan: async (id: string) => {
    const response = await api.patch<Loan>(`/loans/${id}/return`);
    return response.data;
  },
};
