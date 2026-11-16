'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useUserStore } from '../state/user.store';
import type { CreateUserFormData } from '../schemas';
import { UserForm } from './user-form';
import { UserList } from './user-list';
import { UserUpload } from './user-upload';

/** Users page content: heading, "New User" dialog form, Excel upload and the paginated list. */
export function UsersView() {
  const [formOpen, setFormOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const isLoading = useUserStore((state) => state.isLoading);
  const fieldErrors = useUserStore((state) => state.fieldErrors);
  const createUser = useUserStore((state) => state.createUser);

  const handleCreate = async (data: CreateUserFormData): Promise<void> => {
    try {
      await createUser(data);
      setFormOpen(false);
    } catch {
      // The store keeps the dialog open and exposes the server's field errors.
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Users Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            New User
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Users
          </Button>
        </Stack>
      </Box>

      <UserList />
      <UserUpload open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New User</DialogTitle>
        <DialogContent>
          <UserForm onSubmit={handleCreate} isLoading={isLoading} fieldErrors={fieldErrors} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
