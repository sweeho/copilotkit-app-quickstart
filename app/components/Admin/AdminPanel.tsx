'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  listUsers,
  deleteUser,
  type AdminUser,
} from '../../services/adminService';
import UserList from './UserList';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ResetPasswordModal from './ResetPasswordModal';

interface AdminPanelProps {
  currentUserId: string;
  onClose: () => void;
}

export default function AdminPanel({ currentUserId, onClose }: AdminPanelProps) {
  const theme = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteConfirm);
      setDeleteConfirm(null);
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setAddUserOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Add User
          </Button>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <UserList
            users={users}
            currentUserId={currentUserId}
            isLoading={isLoading}
            onEdit={(user) => setEditUser(user)}
            onResetPassword={(userId) => setResetPasswordUserId(userId)}
            onDelete={(userId) => setDeleteConfirm(userId)}
          />
        </Paper>
      </Box>

      {/* Modals */}
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserAdded={loadUsers}
      />

      <EditUserModal
        open={!!editUser}
        user={editUser}
        currentUserId={currentUserId}
        onClose={() => setEditUser(null)}
        onUserUpdated={loadUsers}
      />

      <ResetPasswordModal
        open={!!resetPasswordUserId}
        userId={resetPasswordUserId}
        onClose={() => setResetPasswordUserId(null)}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteConfirm}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
