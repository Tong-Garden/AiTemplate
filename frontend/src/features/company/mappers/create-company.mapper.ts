import type { CreateCompanyDto } from '../dtos';
import type { CreateCompanyFormData } from '../schemas';

/** Maps create-company form values to the request DTO. */
export const createCompanyMapper = {
  toDto: (formData: CreateCompanyFormData): CreateCompanyDto => ({
    name: formData.name,
    address: formData.address,
    phone_number: formData.phone_number,
    timezone: formData.timezone,
  }),
};
