'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useUserStore } from '../state/user.store';

interface UserUploadProps {
  open: boolean;
  onClose: () => void;
}

export function UserUpload({ open, onClose }: UserUploadProps) {
  const isLoadingUpload = useUserStore((state) => state.isLoading);
  const uploadError = useUserStore((state) => state.error);
  const uploadUsers = useUserStore((state) => state.uploadUsers);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file');
      return;
    }

    try {
      const result = await uploadUsers(selectedFile);
      setUploadMessage(`${result.count} users imported successfully`);
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setUploadMessage(null);
      }, 2000);
    } catch {
      // Error is already stored in store
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Users from Excel</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {uploadError && <Alert severity="error">{uploadError}</Alert>}
        {uploadMessage && <Alert severity="success">{uploadMessage}</Alert>}

        <Box sx={{ border: '2px dashed #1976d2', borderRadius: 1, p: 3, textAlign: 'center' }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
            <p>{selectedFile ? selectedFile.name : 'Click to select Excel file'}</p>
          </label>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          disabled={!selectedFile || isLoadingUpload}
        >
          {isLoadingUpload ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
