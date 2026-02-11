'use client';

import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface SessionContextMenuProps {
  anchorPosition: { x: number; y: number } | null;
  onClose: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  sessionName: string;
}

export default function SessionContextMenu({
  anchorPosition,
  onClose,
  onRename,
  onDelete,
  sessionName,
}: SessionContextMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(sessionName);

  const handleRenameClick = () => {
    setNewName(sessionName);
    setRenameOpen(true);
    onClose();
  };

  const handleRenameSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== sessionName) {
      onRename(trimmed);
    }
    setRenameOpen(false);
  };

  const handleDelete = () => {
    onClose();
    onDelete();
  };

  return (
    <>
      <Menu
        open={!!anchorPosition}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={
          anchorPosition
            ? { top: anchorPosition.y, left: anchorPosition.x }
            : undefined
        }
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              '& .MuiMenuItem-root': {
                fontSize: 14,
                py: 1,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3 } },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>
          Rename Session
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
            }}
            label="Session name"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRenameSubmit}
            disabled={!newName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
