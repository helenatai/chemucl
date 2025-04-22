'use client';

import React, { useState } from 'react';
import { updateUserDetailsAction } from 'actions/user/server-actions/updateUser';
import { UserWithRelations } from 'types/user';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../hooks/usePermissions';

// Material UI Imports
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';

// Project Imports
import SubCard from 'components/ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

interface UserInformationProps {
  user: UserWithRelations;
  researchGroups: {
    researchGroupID: number;
    groupName: string;
  }[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const UserInformation: React.FC<UserInformationProps> = ({ user, researchGroups }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    const roles = user.permission?.split(',').map(role => role.trim()) || [];
    return roles.filter(role => role !== '');
  });
  const router = useRouter();
  const { canManageUsers } = usePermissions();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const availableRoles = ['Admin', 'Staff', 'Research Student', 'Auditor'];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    if (name === 'researchGroupID') {
      setEditedUser(prev => ({ 
        ...prev, 
        [name]: value === '' ? null : Number(value),
        researchGroup: value === '' ? null : researchGroups.find(g => g.researchGroupID === Number(value)) || null
      }));
    } else if (name === 'activeStatus') {
      setEditedUser(prev => ({ 
        ...prev, 
        [name]: value === 'true'
      }));
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<typeof selectedRoles>) => {
    const {
      target: { value },
    } = event;
    setSelectedRoles(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSave = async () => {
    try {
      const combinedRoles = selectedRoles.join(', ');
      
      const result = await updateUserDetailsAction({
        id: editedUser.id,
        name: editedUser.name,
        email: editedUser.email,
        permission: combinedRoles,
        researchGroupID: editedUser.researchGroupID,
        activeStatus: editedUser.activeStatus
      });

      if (!result.error) {
        setSnackbarMessage('User updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setIsEditing(false);
        router.refresh();
      } else {
        setSnackbarMessage(`Error: ${result.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbarMessage('An unexpected error occurred');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setSelectedRoles(user.permission?.split(',').map(role => role.trim()).filter(role => role !== '') || []);
    setIsEditing(false);
  };

  return (
    <SubCard title="User Information">
      <Grid container spacing={gridSpacing}>
        {/* Full Name and Email on the same row */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={editedUser.name}
            onChange={handleInputChange}
            InputProps={{ readOnly: !isEditing }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={editedUser.email}
            onChange={handleInputChange}
            InputProps={{ readOnly: !isEditing }}
          />
        </Grid>

        {/* Active Status and Research Group on the same row */}
        <Grid item xs={12} md={6}>
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel id="active-status-label">Active Status</InputLabel>
              <Select
                labelId="active-status-label"
                id="active-status-select"
                name="activeStatus"
                value={editedUser.activeStatus ? 'true' : 'false'}
                label="Active Status"
                onChange={handleSelectChange}
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label="Active Status"
              value={editedUser.activeStatus ? 'True' : 'False'}
              InputProps={{ readOnly: true }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel id="research-group-label">Research Group</InputLabel>
              <Select
                labelId="research-group-label"
                id="research-group-select"
                name="researchGroupID"
                value={editedUser.researchGroupID || ''}
                label="Research Group"
                onChange={(e) => handleSelectChange(e as SelectChangeEvent<string | number>)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {researchGroups.map((group) => (
                  <MenuItem key={group.researchGroupID} value={group.researchGroupID}>
                    {group.groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label="Research Group"
              value={editedUser.researchGroup?.groupName || 'None'}
              InputProps={{ readOnly: true }}
            />
          )}
        </Grid>

        {/* Role selection with chip style */}
        <Grid item xs={12}>
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role-select"
                multiple
                value={selectedRoles}
                onChange={handleRoleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {availableRoles.map((role) => (
                  <MenuItem
                    key={role}
                    value={role}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label="Roles"
              value={selectedRoles.join(', ')}
              InputProps={{ readOnly: true }}
            />
          )}
        </Grid>

        {/* Action buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {isEditing ? (
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
                disabled={!canManageUsers}
              >
                Edit
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </SubCard>
  );
};

export default UserInformation; 