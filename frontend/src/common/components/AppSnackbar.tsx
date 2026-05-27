'use client';
import React, { useState } from 'react';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';
import Slide from '@mui/material/Slide';

type AppSnackbarProps = {
  isSuccess?: boolean | null;
  isUpdated?: boolean | null;
  isDeleted?: boolean | null;
  successMessage?: string;
  updateMessage?: string;
  deleteMessage?: string;
  error?: string | null;
  autoHideDuration?: number;
};

export const AppSnackbar: React.FC<AppSnackbarProps> = ({
  error = null,
  isSuccess = false,
  isUpdated = false,
  isDeleted = false,
  successMessage = 'Operation completed successfully',
  updateMessage = 'Updated successfully',
  deleteMessage = 'Deleted successfully',
  autoHideDuration = 6000,
}) => {
  const active = isSuccess
    ? { key: `success:${successMessage}`, message: successMessage, severity: 'success' as const }
    : isUpdated
      ? { key: `updated:${updateMessage}`, message: updateMessage, severity: 'success' as const }
      : isDeleted
        ? { key: `deleted:${deleteMessage}`, message: deleteMessage, severity: 'success' as const }
        : error
          ? { key: `error:${error}`, message: `Error: ${error}`, severity: 'error' as const }
          : null;

  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const open = !!active && active.key !== dismissedKey;

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') return;
    if (active) setDismissedKey(active.key);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      slots={{ transition: Slide }}
      slotProps={{ transition: { direction: 'down' } }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={handleSnackbarClose}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={active?.severity ?? 'info'}
        sx={{ width: '100%' }}
      >
        {active?.message ?? ''}
      </Alert>
    </Snackbar>
  );
};
