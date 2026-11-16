import { z } from 'zod';
import { createCountrySchema } from './create-country.schema';

/** Validation for updating a country: every field optional. */
export const updateCountrySchema = createCountrySchema.partial();

/** Form values for updating a country. */
export type UpdateCountryFormData = z.input<typeof updateCountrySchema>;
