import { updateUserMapper } from '../mappers';
import { userRepo } from '../repo/user.repo';
import { updateUserSchema } from '../schemas';
import type { UserDto } from '../dtos';
import type { UpdateUserFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and updates the user.
 *
 * @param id - User id.
 * @param formData - Fields to change.
 * @returns The updated user.
 * @throws ZodError when the values are invalid.
 */
export const updateUserService = async (
  id: string,
  formData: UpdateUserFormData,
): Promise<UserDto> => {
  const validated = updateUserSchema.parse(formData);
  return userRepo.update(id, updateUserMapper.toDto(validated));
};
