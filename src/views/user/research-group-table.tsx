'use client';

import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, TextField, InputAdornment, IconButton, Tooltip, Fab,
  Snackbar, Alert, Grid, Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { ResearchGroupWithRelations } from 'types/researchGroup';
import { UserWithRelations } from 'types/user';
import AddFormModal from 'sections/AddFormModal';
import ResearchGroupForm from 'sections/forms/ResearchGroupForm';
import { addResearchGroupAction } from 'actions/research-group/server-actions/addResearchGroup';
import { useRouter, usePathname } from 'next/navigation';
import ResearchGroupInformation from './research-group-information';
import { findUsersByResearchGroup } from 'db/queries/User';
import MainCard from 'ui-component/cards/MainCard';

interface ResearchGroupTableProps {
  initialResearchGroups: ResearchGroupWithRelations[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const ResearchGroupTable: React.FC<ResearchGroupTableProps> = ({ initialResearchGroups }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [groups, setGroups] = useState<ResearchGroupWithRelations[]>(initialResearchGroups);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ResearchGroupWithRelations | null>(null);
  const [groupUsers, setGroupUsers] = useState<UserWithRelations[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value.toLowerCase());
    setPage(0);
  };
  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search)
  );

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const currentPageData = filteredGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const handleDeleteSelected = () => {
    if (!confirm('Are you sure you want to delete the selected group(s)?')) return;
    const remaining = groups.filter((g) => !selectedGroups.includes(g.researchGroupID));
    setGroups(remaining);
    setSelectedGroups([]);
    setSnackbar({
      open: true,
      message: 'Selected groups deleted!',
      severity: 'success'
    });
  };

  const handleAddGroup = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSubmitForm = async (formData: FormData) => {
    const result = await addResearchGroupAction(formData);
    if (!result.error) {
      setSnackbar({
        open: true,
        message: 'Research group added successfully!',
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

  const handleViewGroup = async (group: ResearchGroupWithRelations) => {
    try {
      const users = await findUsersByResearchGroup(group.researchGroupID);
      setGroupUsers(users);
      setSelectedGroup(group);
      router.push(`/user-page/research-group/${group.researchGroupID}`);
    } catch (error) {
      console.error('Error fetching group users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load group members',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (pathname === '/user-page/research-group') {
      setSelectedGroup(null);
      setGroupUsers([]);
    }
  }, [pathname]);

  if (selectedGroup) {
    return (
      <ResearchGroupInformation 
        researchGroup={selectedGroup}
        users={groupUsers}
      />
    );
  }

  return (
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
                  indeterminate={selectedGroups.length > 0 && selectedGroups.length < filteredGroups.length}
                  checked={filteredGroups.length > 0 && selectedGroups.length === filteredGroups.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Group ID</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Total Members</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.map((grp, index) => {
              const selected = isSelected(grp.researchGroupID);
              const sequentialNumber = page * rowsPerPage + index + 1;
              return (
                <TableRow key={grp.researchGroupID}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selected}
                      onChange={(e) => handleClickCheckbox(e, grp.researchGroupID)}
                    />
                  </TableCell>
                  <TableCell>{sequentialNumber}</TableCell>
                  <TableCell>{grp.groupName}</TableCell>
                  <TableCell>{grp.totalMembers}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Group Members" placement="top">
                      <IconButton onClick={() => handleViewGroup(grp)}>
                        <FormatListBulletedIcon />
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
          count={filteredGroups.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add Research Group">
        <ResearchGroupForm 
          onSubmit={handleSubmitForm} 
          onCancel={handleCloseAddModal} 
        />
      </AddFormModal>

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
    </MainCard>
  );
};

export default ResearchGroupTable;
