'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Button, CircularProgress, TextField } from '@mui/material';
import { createCompanySchema } from '../schemas';
import type { CreateCompanyFormData } from '../schemas';
import { TIMEZONES } from './timezones';

type CompanyFormProps = {
  onSubmit: (data: CreateCompanyFormData) => Promise<void>;
  isLoading?: boolean;
  fieldErrors?: Record<string, string>;
};

/**
 * Form for creating a company; client errors come from Zod, server errors from `fieldErrors`.
 *
 * @param props - Submit handler, loading flag and per-field server errors.
 */
export function CompanyForm({ onSubmit, isLoading = false, fieldErrors = {} }: CompanyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '', address: '', phone_number: '', timezone: '' },
  });

  const helper = (field: keyof CreateCompanyFormData): string | undefined =>
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
        label="Address"
        multiline
        minRows={2}
        {...register('address')}
        error={!!helper('address')}
        helperText={helper('address')}
        disabled={isLoading}
      />
      <TextField
        label="Phone number"
        {...register('phone_number')}
        error={!!helper('phone_number')}
        helperText={helper('phone_number')}
        disabled={isLoading}
      />
      <Controller
        name="timezone"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={TIMEZONES}
            value={field.value || null}
            onChange={(_event, value) => field.onChange(value ?? '')}
            disabled={isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Timezone"
                error={!!helper('timezone')}
                helperText={helper('timezone')}
              />
            )}
          />
        )}
      />
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
        {isLoading ? <CircularProgress size={24} /> : 'Create Company'}
      </Button>
    </Box>
  );
}
