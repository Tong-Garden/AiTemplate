import { api } from '@/core/data/remote/api';
import ENDPOINTS from '@/core/data/remote/endpoints';
import { getPaginated } from '@/core/data/remote/paginated';
import type { PaginatedResult } from '@/core/data/remote/api-types';
import type { CountryDto, CreateCountryDto, UpdateCountryDto } from '../dtos';

/** HTTP calls for `/v1/countries`; no validation or mapping. */
export const countryRepo = {
  getAll: (page: number, limit: number): Promise<PaginatedResult<CountryDto[]>> =>
    getPaginated<CountryDto[]>(ENDPOINTS.COUNTRY, { page, limit }),

  getById: async (id: string): Promise<CountryDto> => {
    const { data } = await api.get<CountryDto>(`${ENDPOINTS.COUNTRY}/${id}`);
    return data;
  },

  create: async (payload: CreateCountryDto): Promise<CountryDto> => {
    const { data } = await api.post<CountryDto>(ENDPOINTS.COUNTRY, payload);
    return data;
  },

  update: async (id: string, payload: UpdateCountryDto): Promise<CountryDto> => {
    const { data } = await api.put<CountryDto>(`${ENDPOINTS.COUNTRY}/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.COUNTRY}/${id}`);
  },
};
