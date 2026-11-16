import { z } from 'zod';
import { createCompanySchema } from './create-company.schema';

/** Validation for updating a company: every field optional. */
export const updateCompanySchema = createCompanySchema.partial();

/** Form values for updating a company. */
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
