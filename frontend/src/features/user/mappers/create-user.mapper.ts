import type { CreateUserFormData } from '../schemas';
import type { CreateUserDto } from '../dtos';

export const createUserMapper = {
  toDto: (formData: CreateUserFormData): CreateUserDto => {
    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      is_active: formData.is_active ?? true,
    };
  },
};
