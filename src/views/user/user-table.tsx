'use client';

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, TextField, InputAdornment, 
  Grid, IconButton, Tooltip, Fab, Snackbar, Alert, Box, CardContent
} from '@mui/material';

import { UserWithRelations } from 'types/user';
import AddFormModal from 'sections/AddFormModal';
import UserForm from 'sections/forms/UserForm';
import { ResearchGroupWithRelations } from 'types/researchGroup';
import { addUserAction } from 'actions/user/server-actions/addUser';
import { useRouter } from 'next/navigation';
import { updateUserAction } from 'actions/user/server-actions/updateUser';
import { deleteUserAction } from 'actions/user/server-actions/deleteUser';
import { importUsersAction } from 'actions/user/server-actions/importUsers';
import ImportUsersDialog from 'components/dialogs/ImportUsersDialog';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import VisibilityTwoToneIcon from '@mui/icons-material/Visibility';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';

interface UserTableProps {
  initialUsers: UserWithRelations[];
  initialResearchGroups: ResearchGroupWithRelations[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const UserTable: React.FC<UserTableProps> = ({ initialUsers, initialResearchGroups }) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithRelations[]>(initialUsers);
  const [researchGroups ] = useState<ResearchGroupWithRelations[]>(initialResearchGroups);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    setPage(0);
  };
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery) ||
    u.email.toLowerCase().includes(searchQuery)
  );

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

  // 5. "Add user" example
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSubmitForm = async (formData: FormData) => {
    const result = await addUserAction(formData);
    if (!result.error) {
      setSnackbar({
        open: true,
        message: 'User added successfully!',
        severity: 'success'
      });
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      setSnackbar({
        open: true,
        message: `Error: ${result.error}`,
        severity: 'error'
      });
    }
  };

  const handleAddUser = () => {
    handleOpenAddModal();
  };

  const handleActivateSelected = async () => {
    try {
      const updatedUsers = [...users];
      let success = true;
      
      for (const userId of selectedUsers) {
        const userIndex = updatedUsers.findIndex(u => u.id === userId);
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
        const userIndex = updatedUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1 && updatedUsers[userIndex].activeStatus) {
          const response = await updateUserAction(userId, false);
          if (!response.error && response.users && response.users.length > 0) {
            // Update the user in our local state
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

  const handleViewUser = (userId: string) => {
    router.push(`/user-page/${userId}`);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImport = async (data: any[]) => {
    try {
      const result = await importUsersAction(data);
      if (result.error) {
        setSnackbar({
          open: true,
          message: `Error: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Users imported successfully!',
          severity: 'success'
        });
        router.refresh();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to import users',
        severity: 'error'
      });
    }
  };

  return (
    <>
    <CardContent>
      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            placeholder="Search User"
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{ minWidth: '250px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
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
            <Tooltip title="Import Users">
              <IconButton onClick={handleOpenImportModal}>
                <GetAppTwoToneIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add User">
              <Fab
                color="primary"
                size="small"
                onClick={handleAddUser}
                sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
        </Grid>
      </Grid>
      </CardContent>

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
              <TableCell>User ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Research Group</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.map((user, index) => {
              const selected = isSelected(user.id);
              const sequentialNumber = page * rowsPerPage + index + 1;
              return (
                <TableRow key={user.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selected}
                      onChange={(e) => handleClickCheckbox(e, user.id)}
                    />
                  </TableCell>
                  <TableCell>{sequentialNumber}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.permission}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.researchGroup ? user.researchGroup.groupName : 'No Group'}</TableCell>
                  <TableCell>{user.activeStatus ? 'True' : 'False'}</TableCell>
                  <TableCell>
                    <Tooltip title="View User Details">
                      <IconButton onClick={() => handleViewUser(user.id)}>
                        <VisibilityTwoToneIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ px: 3, pb: 3 }}>
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

      <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add User">
        <UserForm 
          open={isAddModalOpen} 
          onSubmit={handleSubmitForm} 
          onCancel={handleCloseAddModal}
          initialResearchGroups={researchGroups}
        />
      </AddFormModal>

      <ImportUsersDialog
        open={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImport}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserTable;
