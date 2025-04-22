import React, { useState } from 'react';
import { Grid, TextField, IconButton, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Box, TablePagination } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { SearchIcon, PersonAddIcon, PersonAddDisabledIcon, DeleteIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import MainCard from 'components/ui-component/cards/MainCard';

const ResearchGroupInformation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleClickCheckbox = (event, id) => {
    if (event.target.checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((i) => i !== id));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;

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
              ),
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
                <TableRow 
                  key={user.id}
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={(e) => handleClickCheckbox(e, user.id)}
                    />
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