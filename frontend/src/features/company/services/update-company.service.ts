import { updateCompanyMapper } from '../mappers';
import { companyRepo } from '../repo/company.repo';
import { updateCompanySchema } from '../schemas';
import type { CompanyDto } from '../dtos';
import type { UpdateCompanyFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and updates the company.
 *
 * @param id - Company id.
 * @param formData - Fields to change.
 * @returns The updated company.
 * @throws ZodError when the values are invalid.
 */
export const updateCompanyService = async (
  id: string,
  formData: UpdateCompanyFormData,
): Promise<CompanyDto> => {
  const validated = updateCompanySchema.parse(formData);
  return companyRepo.update(id, updateCompanyMapper.toDto(validated));
};
