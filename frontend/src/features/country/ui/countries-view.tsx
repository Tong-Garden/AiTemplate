'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCountryStore } from '../state/country.store';
import type { CreateCountryFormData } from '../schemas';
import { CountryForm } from './country-form';
import { CountryList } from './country-list';

/** Countries page content: heading, "New Country" dialog form and the paginated list. */
export function CountriesView() {
  const [formOpen, setFormOpen] = useState(false);
  const isLoading = useCountryStore((state) => state.isLoading);
  const fieldErrors = useCountryStore((state) => state.fieldErrors);
  const createCountry = useCountryStore((state) => state.createCountry);

  const handleCreate = async (data: CreateCountryFormData): Promise<void> => {
    try {
      await createCountry(data);
      setFormOpen(false);
    } catch {
      // The store keeps the dialog open and exposes the server's field errors.
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Countries
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Country
        </Button>
      </Box>

      <CountryList />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Country</DialogTitle>
        <DialogContent>
          <CountryForm onSubmit={handleCreate} isLoading={isLoading} fieldErrors={fieldErrors} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
