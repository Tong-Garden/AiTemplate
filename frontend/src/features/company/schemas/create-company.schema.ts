import { z } from 'zod';

/** Same limits and phone pattern as the backend, so most errors surface before the request. */
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

/** Validation for the create-company form. */
export const createCompanySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(255),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(500),
  phone_number: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid phone number'),
  timezone: z.string().trim().min(1, 'Timezone is required').max(64),
});

/** Form values for creating a company. */
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
