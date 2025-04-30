import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Box,
  TablePagination
} from '@mui/material';
import { InputAdornment } from '@mui/material';
import { Search as SearchIcon, PersonAdd, PersonAddDisabled, Delete as DeleteIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import MainCard from 'components/ui-component/cards/MainCard';
import { UserWithRelations } from 'types/user';

interface ResearchGroupInformationProps {
  users: UserWithRelations[];
}

const ResearchGroupInformation: React.FC<ResearchGroupInformationProps> = ({ users }) => {
  const [searchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRelations[]>(users);
  const [currentPageData, setCurrentPageData] = useState<UserWithRelations[]>(users);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    const filtered = users.filter(
      (user) => user.name.toLowerCase().includes(searchValue) || user.email.toLowerCase().includes(searchValue)
    );
    setFilteredUsers(filtered);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleClickCheckbox = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const selectedIndex = selectedUsers.indexOf(id);
    if (selectedIndex === -1) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActivateSelected = async () => {
    // TODO: Implement activate functionality
    console.log('Activate selected users:', selectedUsers);
  };

  const handleDeactivateSelected = async () => {
    // TODO: Implement deactivate functionality
    console.log('Deactivate selected users:', selectedUsers);
  };

  const handleDeleteSelected = async () => {
    // TODO: Implement delete functionality
    console.log('Delete selected users:', selectedUsers);
  };

  const isSelected = (id: string) => selectedUsers.indexOf(id) !== -1;

  // Update currentPageData when page, rowsPerPage, or filteredUsers change
  useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setCurrentPageData(filteredUsers.slice(start, end));
  }, [page, rowsPerPage, filteredUsers]);

  return (
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
                  <PersonAdd />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deactivate Selected">
                <IconButton onClick={handleDeactivateSelected}>
                  <PersonAddDisabled />
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
    </MainCard>
  );
};

export default ResearchGroupInformation;
