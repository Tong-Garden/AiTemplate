'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCompanyStore } from '../state/company.store';
import type { CreateCompanyFormData } from '../schemas';
import { CompanyForm } from './company-form';
import { CompanyList } from './company-list';

/** Companies page content: heading, "New Company" dialog form and the paginated list. */
export function CompaniesView() {
  const [formOpen, setFormOpen] = useState(false);
  const isLoading = useCompanyStore((state) => state.isLoading);
  const fieldErrors = useCompanyStore((state) => state.fieldErrors);
  const createCompany = useCompanyStore((state) => state.createCompany);

  const handleCreate = async (data: CreateCompanyFormData): Promise<void> => {
    try {
      await createCompany(data);
      setFormOpen(false);
    } catch {
      // The store keeps the dialog open and exposes the server's field errors.
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Companies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Company
        </Button>
      </Box>

      <CompanyList />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Company</DialogTitle>
        <DialogContent>
          <CompanyForm onSubmit={handleCreate} isLoading={isLoading} fieldErrors={fieldErrors} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
