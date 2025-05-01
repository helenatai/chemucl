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
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MainCard from 'ui-component/cards/MainCard';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';

import { LogWithRelations } from 'types/log';

interface LogsPageProps {
  initialLogs: LogWithRelations[];
}

const LogsPage: React.FC<LogsPageProps> = ({ initialLogs }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // For snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage] = useState('');
  const [snackbarSeverity] = useState<'success' | 'error'>('success');

  // 1. Searching
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.toLowerCase();
    setSearch(val);
    setPage(0);
  };

  const filteredLogs = initialLogs.filter((log) => {
    // You can check chemical name, user name, or action, etc.
    const chemName = log.chemicalName?.toLowerCase() ?? '';
    const userName = log.user?.name.toLowerCase() ?? '';
    const actionType = log.actionType.toLowerCase();
    const locationStr = `${log.locationBuilding || ''} ${log.locationRoom || ''}`.toLowerCase();

    return chemName.includes(search) || userName.includes(search) || actionType.includes(search) || locationStr.includes(search);
  });

  // 2. Pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const currentPageData = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN]} fallbackPath="/inventory-page">
      <MainCard>
        {/* Top bar with search & actions */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <TextField
              placeholder="Search"
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
        </Grid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Log ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Chemical Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((log) => {
                return (
                  <TableRow key={log.logID}>
                    <TableCell>{log.logID}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.chemicalName || 'N/A'}</TableCell>
                    <TableCell>{`${log.locationBuilding || 'N/A'} ${log.locationRoom || ''}`}</TableCell>
                    <TableCell>{log.actionType}</TableCell>
                    <TableCell>{log.user ? log.user.name : 'N/A'}</TableCell>
                    <TableCell>{log.user ? log.user.permission : 'N/A'}</TableCell>
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
          count={filteredLogs.length}
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
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </MainCard>
    </RoleGuard>
  );
};

export default LogsPage;
