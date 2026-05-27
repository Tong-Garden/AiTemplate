import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(5, 'Phone must be at least 5 characters').optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
