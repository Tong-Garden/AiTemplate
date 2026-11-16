'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { createCountrySchema } from '../schemas';
import type { CreateCountryFormData } from '../schemas';

type CountryFormProps = {
  onSubmit: (data: CreateCountryFormData) => Promise<void>;
  isLoading?: boolean;
  fieldErrors?: Record<string, string>;
};

/**
 * Form for creating a country; client errors come from Zod, server errors from `fieldErrors`.
 *
 * @param props - Submit handler, loading flag and per-field server errors.
 */
export function CountryForm({ onSubmit, isLoading = false, fieldErrors = {} }: CountryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCountrySchema),
    defaultValues: { name: '', iso_code: '', phone_code: '' },
  });

  const helper = (field: keyof CreateCountryFormData): string | undefined =>
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
        label="ISO code"
        {...register('iso_code')}
        error={!!helper('iso_code')}
        helperText={helper('iso_code') ?? 'Two letters, e.g. SG'}
        disabled={isLoading}
      />
      <TextField
        label="Phone code"
        {...register('phone_code')}
        error={!!helper('phone_code')}
        helperText={helper('phone_code') ?? 'With a plus sign, e.g. +65'}
        disabled={isLoading}
      />
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
        {isLoading ? <CircularProgress size={24} /> : 'Create Country'}
      </Button>
    </Box>
  );
}
