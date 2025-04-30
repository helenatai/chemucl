'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Checkbox,
  Box
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';
import { ResearchGroupWithRelations } from 'types/researchGroup';
import { UserWithRelations } from 'types/user';
import { useRouter } from 'next/navigation';
import { updateUserAction } from 'actions/user/server-actions/updateUser';
import { deleteUserAction } from 'actions/user/server-actions/deleteUser';

// assets
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';

interface ResearchGroupInformationProps {
  researchGroup: ResearchGroupWithRelations;
  users: UserWithRelations[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const ResearchGroupInformation: React.FC<ResearchGroupInformationProps> = ({ researchGroup, users: initialUsers }) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithRelations[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    setPage(0);
  };
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(searchQuery) || u.email.toLowerCase().includes(searchQuery));

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const currentPageData = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIDs = filteredUsers.map((u) => u.id);
      setSelectedUsers(allIDs);
      return;
    }
    setSelectedUsers([]);
  };

  const handleClickCheckbox = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = [...selectedUsers, id];
    } else {
      newSelected = selectedUsers.filter((selectedId) => selectedId !== id);
    }
    setSelectedUsers(newSelected);
  };

  const isSelected = (id: string) => selectedUsers.indexOf(id) !== -1;

  const handleDeleteSelected = async () => {
    if (!confirm('Are you sure you want to delete the selected user(s)?')) return;

    const result = await deleteUserAction(selectedUsers);
    if (!result.error) {
      const remaining = users.filter((u) => !selectedUsers.includes(u.id));
      setUsers(remaining);
      setSelectedUsers([]);
      setSnackbar({
        open: true,
        message: 'Selected user(s) deleted successfully!',
        severity: 'success'
      });
      router.refresh();
    } else {
      setSnackbar({
        open: true,
        message: `Error: ${result.error}`,
        severity: 'error'
      });
    }
  };

  const handleActivateSelected = async () => {
    try {
      const updatedUsers = [...users];
      let success = true;

      for (const userId of selectedUsers) {
        const userIndex = updatedUsers.findIndex((u) => u.id === userId);
        if (userIndex !== -1 && !updatedUsers[userIndex].activeStatus) {
          const response = await updateUserAction(userId, true);
          if (!response.error && response.users && response.users.length > 0) {
            updatedUsers[userIndex] = response.users[0];
          } else {
            success = false;
          }
        }
      }

      if (success) {
        setUsers(updatedUsers);
        setSnackbar({
          open: true,
          message: 'Selected user(s) activated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Some user(s) could not be activated',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error activating users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to activate users',
        severity: 'error'
      });
    }
  };

  const handleDeactivateSelected = async () => {
    try {
      const updatedUsers = [...users];
      let success = true;

      for (const userId of selectedUsers) {
        const userIndex = updatedUsers.findIndex((u) => u.id === userId);
        if (userIndex !== -1 && updatedUsers[userIndex].activeStatus) {
          const response = await updateUserAction(userId, false);
          if (!response.error && response.users && response.users.length > 0) {
            updatedUsers[userIndex] = response.users[0];
          } else {
            success = false;
          }
        }
      }

      if (success) {
        setUsers(updatedUsers);
        setSnackbar({
          open: true,
          message: 'Selected user(s) deactivated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Some user(s) could not be deactivated',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deactivating users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to deactivate users',
        severity: 'error'
      });
    }
  };

  return (
    <MainCard>
      <MainCard contentSX={{ p: 0 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2, pb: 1 }}>
          <Grid item>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              placeholder="Search Member"
              value={searchQuery}
              onChange={handleSearch}
              size="small"
            />
          </Grid>
          <Grid item>
            {selectedUsers.length > 0 && (
              <>
                <Tooltip title="Activate Selected">
                  <IconButton onClick={handleActivateSelected}>
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Deactivate Selected">
                  <IconButton onClick={handleDeactivateSelected}>
                    <PersonAddDisabledIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Selected">
                  <IconButton onClick={handleDeleteSelected}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Active Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((user) => {
                const isItemSelected = isSelected(user.id);
                return (
                  <TableRow key={user.id} hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} onChange={(e) => handleClickCheckbox(e, user.id)} />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.permission}</TableCell>
                    <TableCell>{user.activeStatus ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                );
              })}
              {currentPageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 2, py: 1.5 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MainCard>
    </MainCard>
  );
};

export default ResearchGroupInformation;
