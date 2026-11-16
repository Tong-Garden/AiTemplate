import type { CreateUserFormData } from '../schemas';
import type { CreateUserDto } from '../dtos';

/** Pure form-to-DTO transformation for creating a user. */
export const createUserMapper = {
  /**
   * Maps validated form values to the create request body.
   *
   * @param formData - Validated create form values.
   * @returns The request body for `POST /v1/users`.
   */
  toDto: (formData: CreateUserFormData): CreateUserDto => ({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    is_active: formData.is_active ?? true,
  }),
};
