import { updateUserSchema } from '../schemas';
import { updateUserMapper } from '../mappers';
import { userApi } from '../repo/user.api';
import type { UserDto } from '../dtos';
import type { UpdateUserFormData } from '../schemas';

export const updateUserService = async (
  id: string,
  formData: UpdateUserFormData,
): Promise<UserDto> => {
  if (!id) {
    throw new Error('User ID is required');
  }

  // Validate using Zod schema
  const validatedData = updateUserSchema.parse(formData);

  // Map form data to DTO
  const dto = updateUserMapper.toDto(validatedData);

  // Call API
  return userApi.update(id, dto);
};
