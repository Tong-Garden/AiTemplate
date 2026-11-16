import { api } from '@/core/data/remote/api';
import ENDPOINTS from '@/core/data/remote/endpoints';
import { getPaginated } from '@/core/data/remote/paginated';
import type { PaginatedResult } from '@/core/data/remote/api-types';
import type { CompanyDto, CreateCompanyDto, UpdateCompanyDto } from '../dtos';

/** HTTP calls for `/v1/companies`; no validation or mapping. */
export const companyRepo = {
  getAll: (page: number, limit: number): Promise<PaginatedResult<CompanyDto[]>> =>
    getPaginated<CompanyDto[]>(ENDPOINTS.COMPANY, { page, limit }),

  getById: async (id: string): Promise<CompanyDto> => {
    const { data } = await api.get<CompanyDto>(`${ENDPOINTS.COMPANY}/${id}`);
    return data;
  },

  create: async (payload: CreateCompanyDto): Promise<CompanyDto> => {
    const { data } = await api.post<CompanyDto>(ENDPOINTS.COMPANY, payload);
    return data;
  },

  update: async (id: string, payload: UpdateCompanyDto): Promise<CompanyDto> => {
    const { data } = await api.put<CompanyDto>(`${ENDPOINTS.COMPANY}/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.COMPANY}/${id}`);
  },
};
