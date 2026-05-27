import { api } from '@/core/data/remote/api';
import ENDPOINTS from '@/core/data/remote/endpoints';
import type { CreateUserDto, UpdateUserDto, UserDto } from '../dtos';

export const userApi = {
  getAll: async (): Promise<UserDto[]> => {
    const { data } = await api.get<UserDto[]>(ENDPOINTS.USER);
    return data;
  },

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

  uploadUsers: async (file: File): Promise<{ count: number; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ count: number; message: string }>(
      `${ENDPOINTS.USER}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  },
};
