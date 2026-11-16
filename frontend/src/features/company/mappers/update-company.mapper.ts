import type { UpdateCompanyDto } from '../dtos';
import type { UpdateCompanyFormData } from '../schemas';

/** Maps update-company form values to the request DTO. */
export const updateCompanyMapper = {
  toDto: (formData: UpdateCompanyFormData): UpdateCompanyDto => ({
    name: formData.name,
    address: formData.address,
    phone_number: formData.phone_number,
    timezone: formData.timezone,
  }),
};
