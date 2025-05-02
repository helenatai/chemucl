'use client';

import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { AuditGeneralWithRelations } from 'types/auditGeneral';
import { LocationWithRelations } from 'types/location';
import AddFormModal from 'components/forms/AddFormModal';
import AuditForm from 'components/forms/AuditForm';
import { addAuditAction } from 'actions/audit/server-actions/addAudit';
import { useRouter } from 'next/navigation';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Material UI Imports
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
  CardContent,
  Grid,
  Snackbar,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';

// assets
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';

interface AuditGeneralPageProps {
  initialAudits: AuditGeneralWithRelations[];
  initialLocations: LocationWithRelations[];
}

const AuditGeneralPage: React.FC<AuditGeneralPageProps> = ({ initialAudits, initialLocations }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [audits] = useState<AuditGeneralWithRelations[]>(initialAudits);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value.toLowerCase());
    setPage(0);
  };

  const filteredAudits = audits.filter((audit) => {
    const auditorName = audit.auditor?.name.toLowerCase() || '';
    const roundStr = audit.round.toString();
    const status = audit.status.toLowerCase();
    return auditorName.includes(search) || roundStr.includes(search) || status.includes(search);
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSubmitAuditForm = async (locationsArr: { buildingName: string; room: string }[]) => {
    if (!session?.user?.id) {
      setSnackbarMessage('Error: User not authenticated');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('auditorID', session.user.id);
    formData.append('locations', JSON.stringify(locationsArr));

    const response = await addAuditAction(formData);

    if (response.success) {
      setSnackbarMessage('Audit added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      setSnackbarMessage(`Error: ${response.error}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const currentPageData = filteredAudits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleView = (auditGeneralID: number) => {
    router.push(`/audit-page/${auditGeneralID}`);
  };

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN, ROLES.AUDITOR]} fallbackPath="/inventory-page">
      <MainCard>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs={isMobile ? 9 : 'auto'} sm={'auto'}>
              <TextField
                placeholder="Search Audit"
                value={search}
                onChange={handleSearch}
                size="small"
                sx={{
                  width: isMobile ? '100%' : '250px' // Fixed width for desktop, full width for mobile
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={isMobile ? 3 : 'auto'} sm={'auto'} sx={{ textAlign: 'right' }}>
              <Tooltip title="Add Audit">
                <Fab
                  color="primary"
                  size="small"
                  onClick={handleOpenAddModal}
                  sx={{ boxShadow: 'none', ml: isMobile ? 0 : 1, width: 32, height: 32, minHeight: 32 }}
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
                <TableCell>Round</TableCell>
                {!isMobile && <TableCell>Progress</TableCell>}
                <TableCell>Status</TableCell>
                {!isTablet && <TableCell>Auditor</TableCell>}
                {!isMobile && <TableCell>Start Time</TableCell>}
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((audit) => (
                <TableRow key={audit.auditGeneralID}>
                  <TableCell>{audit.round}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      {audit.finishedCount} / {audit.finishedCount + audit.pendingCount}
                    </TableCell>
                  )}
                  <TableCell>{audit.status}</TableCell>
                  {!isTablet && <TableCell>{audit.auditor ? audit.auditor.name : 'N/A'}</TableCell>}
                  {!isMobile && <TableCell>{audit.startDate ? new Date(audit.startDate).toLocaleString() : 'N/A'}</TableCell>}
                  <TableCell>
                    <Grid container spacing={1}>
                      <Grid item>
                        <button onClick={() => handleView(audit.auditGeneralID)}>View</button>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAudits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Locations for New Audit">
          <AuditForm onSubmit={handleSubmitAuditForm} onCancel={handleCloseAddModal} initialLocations={initialLocations} />
        </AddFormModal>

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

export default AuditGeneralPage;
