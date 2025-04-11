'use client';

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, TextField, InputAdornment, IconButton, Tooltip, Fab,
  Snackbar, Alert, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MainCard from 'ui-component/cards/MainCard';

import { ResearchGroupWithRelations } from 'types/researchGroup';

interface ResearchGroupTableProps {
  initialResearchGroups: ResearchGroupWithRelations[];
}

const ResearchGroupTable: React.FC<ResearchGroupTableProps> = ({ initialResearchGroups }) => {
  const [groups, setGroups] = useState<ResearchGroupWithRelations[]>(initialResearchGroups);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 1. Searching
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value.toLowerCase());
    setPage(0);
  };
  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search)
  );

  // 2. Pagination
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const currentPageData = filteredGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 3. Checkbox logic
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIDs = filteredGroups.map((g) => g.researchGroupID);
      setSelectedGroups(allIDs);
      return;
    }
    setSelectedGroups([]);
  };
  const handleClickCheckbox = (event: React.ChangeEvent<HTMLInputElement>, rgID: number) => {
    const selectedIndex = selectedGroups.indexOf(rgID);
    let newSelected: number[] = [];
    if (selectedIndex === -1) {
      newSelected = [...selectedGroups, rgID];
    } else {
      newSelected = selectedGroups.filter((id) => id !== rgID);
    }
    setSelectedGroups(newSelected);
  };
  const isSelected = (rgID: number) => selectedGroups.indexOf(rgID) !== -1;

  // 4. Delete selected
  const handleDeleteSelected = () => {
    if (!confirm('Are you sure you want to delete the selected group(s)?')) return;
    const remaining = groups.filter((g) => !selectedGroups.includes(g.researchGroupID));
    setGroups(remaining);
    setSelectedGroups([]);
    setSnackbarMessage('Selected groups deleted!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // 5. Add group
  const handleAddGroup = () => {
  };

  return (
    <>
    <MainCard>
    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <TextField
            placeholder="Search Group"
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
          {selectedGroups.length > 0 && (
            <Tooltip title="Delete Selected">
              <IconButton onClick={handleDeleteSelected}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Add Group">
            <Fab
              color="primary"
              size="small"
              onClick={handleAddGroup}
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
                  indeterminate={
                    selectedGroups.length > 0 && selectedGroups.length < filteredGroups.length
                  }
                  checked={
                    filteredGroups.length > 0 &&
                    selectedGroups.length === filteredGroups.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Group ID</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Total Members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.map((grp) => {
              const selected = isSelected(grp.researchGroupID);
              return (
                <TableRow key={grp.researchGroupID}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selected}
                      onChange={(e) => handleClickCheckbox(e, grp.researchGroupID)}
                    />
                  </TableCell>
                  <TableCell>{grp.researchGroupID}</TableCell>
                  <TableCell>{grp.groupName}</TableCell>
                  <TableCell>{grp.totalMembers}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredGroups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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

export default ResearchGroupTable;
