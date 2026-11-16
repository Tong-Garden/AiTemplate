import { api } from '@/core/data/remote/api';
import ENDPOINTS from '@/core/data/remote/endpoints';
import { getPaginated } from '@/core/data/remote/paginated';
import type { PaginatedResult } from '@/core/data/remote/api-types';
import type { CreateUserDto, UpdateUserDto, UploadUsersResultDto, UserDto } from '../dtos';

/** HTTP calls for `/v1/users`; no validation or mapping. */
export const userRepo = {
  getAll: (page: number, limit: number): Promise<PaginatedResult<UserDto[]>> =>
    getPaginated<UserDto[]>(ENDPOINTS.USER, { page, limit }),

  getById: async (id: string): Promise<UserDto> => {
    const { data } = await api.get<UserDto>(`${ENDPOINTS.USER}/${id}`);
    return data;
  },

  create: async (payload: CreateUserDto): Promise<UserDto> => {
    const { data } = await api.post<UserDto>(ENDPOINTS.USER, payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserDto): Promise<UserDto> => {
    const { data } = await api.put<UserDto>(`${ENDPOINTS.USER}/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.USER}/${id}`);
  },

  uploadUsers: async (file: File): Promise<UploadUsersResultDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<UploadUsersResultDto>(`${ENDPOINTS.USER}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
