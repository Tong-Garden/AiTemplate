import type { UpdateUserFormData } from '../schemas';
import type { UpdateUserDto } from '../dtos';

/** Pure form-to-DTO transformation for updating a user. */
export const updateUserMapper = {
  /**
   * Maps validated form values to the update request body.
   *
   * @param formData - Validated update form values.
   * @returns The request body for `PUT /v1/users/{id}`.
   */
  toDto: (formData: UpdateUserFormData): UpdateUserDto => ({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    is_active: formData.is_active,
  }),
};
