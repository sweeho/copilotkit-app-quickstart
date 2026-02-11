'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { updateUser, type AdminUser } from '../../services/adminService';

interface EditUserModalProps {
  open: boolean;
  user: AdminUser | null;
  currentUserId: string;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function EditUserModal({
  open,
  user,
  currentUserId,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user?.user_id === currentUserId;

  useEffect(() => {
    if (user) {
      setIsAdmin(user.is_admin);
      setIsActive(user.is_active);
      setError(null);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await updateUser(user.user_id, { is_admin: isAdmin, is_active: isActive });
      onUserUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>
        Edit User
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {user.user_id}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              disabled={isSelf}
            />
          }
          label="Admin privileges"
        />
        {isSelf && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mb: 1 }}>
            You cannot change your own admin status
          </Typography>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSelf}
            />
          }
          label="Account active"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
