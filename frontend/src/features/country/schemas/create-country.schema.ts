import { z } from 'zod';

/** Same rules as the backend: name 2-100, ISO 3166-1 alpha-2, dialling code like +65. */
export const createCountrySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  iso_code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'ISO code must be two letters')
    .transform((value) => value.toUpperCase()),
  phone_code: z
    .string()
    .trim()
    .regex(/^\+[0-9]{1,4}$/, 'Phone code must look like +65'),
});

/** Form values for creating a country. */
export type CreateCountryFormData = z.input<typeof createCountrySchema>;
