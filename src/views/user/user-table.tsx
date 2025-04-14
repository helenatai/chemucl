'use client';

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, TextField, InputAdornment, 
  Grid, IconButton, Tooltip, Fab, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import MainCard from 'ui-component/cards/MainCard';
import { UserWithRelations } from 'types/user';

interface UserTableProps {
  initialUsers: UserWithRelations[];
}

const UserTable: React.FC<UserTableProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<UserWithRelations[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // For modal or snackbars
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 1. Searching
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value.toLowerCase());
    setPage(0);
  };
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search) ||
    u.email.toLowerCase().includes(search)
  );

  // 2. Pagination
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const currentPageData = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 3. Checkbox logic
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

  // 4. "Delete selected" example
  const handleDeleteSelected = () => {
    if (!confirm('Are you sure you want to delete the selected user(s)?')) return;
    const remaining = users.filter((u) => !selectedUsers.includes(u.id));
    setUsers(remaining);
    setSelectedUsers([]);
    setSnackbarMessage('Selected users deleted!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // 5. "Add user" example
  const handleAddUser = () => {

  };

  // 6. Rendering
  return (
    <>
    <MainCard>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <TextField
            placeholder="Search User"
            value={search}
            onChange={handleSearch}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item>
          {selectedUsers.length > 0 && (
            <Tooltip title="Delete Selected">
              <IconButton onClick={handleDeleteSelected}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.map((user, index) => {
              const selected = isSelected(user.id);
              // Calculate the sequential number based on current page and rows per page
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </MainCard>
    </>
  );
};

export default UserTable;
