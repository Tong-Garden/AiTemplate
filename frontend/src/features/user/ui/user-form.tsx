'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { createUserSchema } from '../schemas';
import type { CreateUserFormData } from '../schemas';

type UserFormInput = z.input<typeof createUserSchema>;

type UserFormProps = {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
  fieldErrors?: Record<string, string>;
};

/**
 * Form for creating a user; client errors come from Zod, server errors from `fieldErrors`.
 *
 * @param props - Submit handler, loading flag and per-field server errors.
 */
export function UserForm({ onSubmit, isLoading = false, fieldErrors = {} }: UserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInput, unknown, CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', phone: '', is_active: true },
  });

  const helper = (field: keyof UserFormInput): string | undefined =>
    errors[field]?.message ?? fieldErrors[field];

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
    >
      <TextField
        label="Name"
        {...register('name')}
        error={!!helper('name')}
        helperText={helper('name')}
        disabled={isLoading}
      />
      <TextField
        label="Email"
        {...register('email')}
        error={!!helper('email')}
        helperText={helper('email')}
        disabled={isLoading}
      />
      <TextField
        label="Phone"
        {...register('phone')}
        error={!!helper('phone')}
        helperText={helper('phone')}
        disabled={isLoading}
      />
      <Controller
        name="is_active"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            }
            label="Active"
            disabled={isLoading}
          />
        )}
      />
      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Create User'}
      </Button>
    </Box>
  );
}
