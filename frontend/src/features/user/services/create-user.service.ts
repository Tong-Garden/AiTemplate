import { createUserSchema } from '../schemas';
import { createUserMapper } from '../mappers';
import { userApi } from '../repo/user.api';
import type { UserDto } from '../dtos';
import type { CreateUserFormData } from '../schemas';

export const createUserService = async (formData: CreateUserFormData): Promise<UserDto> => {
  // Validate using Zod schema
  const validatedData = createUserSchema.parse(formData);

  // Map form data to DTO
  const dto = createUserMapper.toDto(validatedData);

  // Call API
  return userApi.create(dto);
};
