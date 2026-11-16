import type { ApiError } from '@/core/data/remote/api-error';
import type { PaginationMetaDto } from '@/core/data/remote/api-types';
import type { UploadUsersResultDto, UserDto } from '../dtos';
import type { CreateUserFormData, UpdateUserFormData } from '../schemas';

/** Data and status flags held by the user store. */
export type UserState = {
  users: UserDto[];
  selectedUser: UserDto | null;
  pagination: PaginationMetaDto;
  isLoading: boolean;
  error: string | null;
  errors: ApiError[];
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};

/** User store: state plus the actions that change it. */
export type UserStore = UserState & {
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (formData: CreateUserFormData) => Promise<UserDto>;
  updateUser: (id: string, formData: UpdateUserFormData) => Promise<UserDto>;
  deleteUser: (id: string) => Promise<void>;
  uploadUsers: (file: File) => Promise<UploadUsersResultDto>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
};
