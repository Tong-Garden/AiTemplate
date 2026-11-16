import { createUserMapper } from '../mappers';
import { userRepo } from '../repo/user.repo';
import { createUserSchema } from '../schemas';
import type { UserDto } from '../dtos';
import type { CreateUserFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and creates the user.
 *
 * @param formData - Raw form values.
 * @returns The created user.
 * @throws ZodError when the values are invalid.
 */
export const createUserService = async (formData: CreateUserFormData): Promise<UserDto> => {
  const validated = createUserSchema.parse(formData);
  return userRepo.create(createUserMapper.toDto(validated));
};
