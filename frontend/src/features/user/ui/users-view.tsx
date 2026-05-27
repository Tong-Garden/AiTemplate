'use client';

import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { UserList } from './user-list';
import { UserUpload } from './user-upload';

export function UsersView() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Users Management
        </Typography>
        <Stack direction="row" spacing={2}>
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
    </Box>
  );
}
