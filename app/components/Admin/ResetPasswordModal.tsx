'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { resetPassword } from '../../services/adminService';

interface ResetPasswordModalProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function ResetPasswordModal({
  open,
  userId,
  onClose,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !newPassword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(userId, newPassword.trim());
      setSuccess(true);
      setTimeout(() => handleClose(), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!userId) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>
        Reset Password
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset successfully!
          </Alert>
        )}
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Set new password for <strong>{userId}</strong>
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          disabled={success}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !newPassword.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
