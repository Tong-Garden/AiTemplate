'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { AppSnackbar } from '@/common/components';
import { useUserStore } from '../state/user.store';

type UserUploadProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Dialog for importing users from an Excel file.
 *
 * Failures show in the list's snackbar, which reads the same store error.
 *
 * @param props - Whether the dialog is open and the close handler.
 */
export function UserUpload({ open, onClose }: UserUploadProps) {
  const isLoading = useUserStore((state) => state.isLoading);
  const uploadUsers = useUserStore((state) => state.uploadUsers);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;
    try {
      const result = await uploadUsers(selectedFile);
      setImportedCount(result.count);
      setSelectedFile(null);
      onClose();
    } catch {
      // The store recorded the error and the list snackbar shows it.
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Users from Excel</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
            }}
          >
            <Box
              component="input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              id="file-input"
              sx={{ display: 'none' }}
            />
            <Box
              component="label"
              htmlFor="file-input"
              sx={{ cursor: 'pointer', display: 'block' }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography>
                {selectedFile ? selectedFile.name : 'Click to select Excel file'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        isSuccess={importedCount !== null}
        successMessage={`${importedCount ?? 0} users imported successfully`}
      />
    </>
  );
}
