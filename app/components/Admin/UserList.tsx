'use client';

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { AdminUser } from '../../services/adminService';

interface UserListProps {
  users: AdminUser[];
  currentUserId: string;
  isLoading: boolean;
  onEdit: (user: AdminUser) => void;
  onResetPassword: (userId: string) => void;
  onDelete: (userId: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UserList({
  users,
  currentUserId,
  isLoading,
  onEdit,
  onResetPassword,
  onDelete,
}: UserListProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">No users found.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              User
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Role
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Last Login
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.user_id === currentUserId;
            return (
              <TableRow key={user.user_id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: isSelf ? 600 : 400 }}>
                      {user.user_id}
                    </Typography>
                    {isSelf && (
                      <Chip
                        label="You"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_admin ? 'Admin' : 'User'}
                    size="small"
                    color={user.is_admin ? 'warning' : 'default'}
                    sx={{ height: 22, fontSize: 11, fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={user.is_active ? 'success' : 'default'}
                    sx={{ height: 22, fontSize: 11, fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {formatDate(user.last_login)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(user)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset password">
                      <IconButton size="small" onClick={() => onResetPassword(user.user_id)}>
                        <LockResetOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!isSelf && (
                      <Tooltip title="Delete user">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(user.user_id)}
                          sx={{ '&:hover': { color: theme.palette.error.main } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
