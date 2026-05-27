import type { UpdateUserFormData } from '../schemas';
import type { UpdateUserDto } from '../dtos';

export const updateUserMapper = {
  toDto: (formData: UpdateUserFormData): UpdateUserDto => {
    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      is_active: formData.is_active,
    };
  },
};
