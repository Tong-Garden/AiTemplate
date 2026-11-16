import { createCompanyMapper } from '../mappers';
import { companyRepo } from '../repo/company.repo';
import { createCompanySchema } from '../schemas';
import type { CompanyDto } from '../dtos';
import type { CreateCompanyFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and creates the company.
 *
 * @param formData - Raw form values.
 * @returns The created company.
 * @throws ZodError when the values are invalid.
 */
export const createCompanyService = async (
  formData: CreateCompanyFormData,
): Promise<CompanyDto> => {
  const validated = createCompanySchema.parse(formData);
  return companyRepo.create(createCompanyMapper.toDto(validated));
};
