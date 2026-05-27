'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { createUserSchema, updateUserSchema } from '../schemas';
import type { CreateUserFormData, UpdateUserFormData } from '../schemas';
import type { UserDto } from '../dtos';

type UserFormProps =
  | {
      mode: 'create';
      initialData?: undefined;
      onSubmit: (data: CreateUserFormData) => Promise<void>;
      isLoading?: boolean;
      error?: string | null;
    }
  | {
      mode: 'edit';
      initialData?: UserDto;
      onSubmit: (data: UpdateUserFormData) => Promise<void>;
      isLoading?: boolean;
      error?: string | null;
    };

export function UserForm({ mode, initialData, onSubmit, isLoading, error }: UserFormProps) {
  const schema = mode === 'create' ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'edit' && initialData
        ? {
            name: initialData.name,
            email: initialData.email,
            phone: initialData.phone,
            is_active: initialData.is_active,
          }
        : {
            name: '',
            email: '',
            phone: '',
            is_active: true,
          },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((data) => (onSubmit as (d: typeof data) => Promise<void>)(data))}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Name"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        disabled={isLoading}
      />

      <TextField
        label="Email"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />

      <TextField
        label="Phone"
        {...register('phone')}
        error={!!errors.phone}
        helperText={errors.phone?.message}
        disabled={isLoading}
      />

      <FormControlLabel
        control={<Checkbox {...register('is_active')} />}
        label="Active"
        disabled={isLoading}
      />

      <Button type="submit" variant="contained" color="primary" disabled={isLoading} sx={{ mt: 2 }}>
        {isLoading ? (
          <CircularProgress size={24} />
        ) : mode === 'create' ? (
          'Create User'
        ) : (
          'Update User'
        )}
      </Button>
    </Box>
  );
}
