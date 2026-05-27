import type { UserDto } from '../dtos';
import type { CreateUserFormData, UpdateUserFormData } from '../schemas';

export type UserState = {
  // Data
  users: UserDto[];
  selectedUser: UserDto | null;

  // Single status state
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  isUploaded: boolean;
};

export type UserStore = UserState & {
  // Actions
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (formData: CreateUserFormData) => Promise<UserDto>;
  updateUser: (id: string, formData: UpdateUserFormData) => Promise<UserDto>;
  deleteUser: (id: string) => Promise<void>;
  uploadUsers: (file: File) => Promise<{ count: number; message: string }>;
  clearError: () => void;
};
