'use client';

import React, { useState } from 'react';
import { LocationWithRelations } from 'types/location';
import { useRouter } from 'next/navigation';
import { usePermissions } from 'hooks/usePermissions';
import { addLocationAction } from 'actions/location/server-actions/addLocation';
import { deleteLocationAction } from 'actions/location/server-actions/deleteLocation';
import AddFormModal from 'sections/AddFormModal';
import LocationForm from 'sections/forms/LocationForm';
import QrCodeModal from 'components/modals/QrCodeModal';

// Material UI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import MainCard from 'ui-component/cards/MainCard';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

// assets
import VisibilityTwoToneIcon from '@mui/icons-material/Visibility';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/InfoOutlined';

interface LocationPageProps {
  initialLocations: LocationWithRelations[];
}

const LocationPage: React.FC<LocationPageProps> = ({ initialLocations }) => {
  const router = useRouter();
  const { canModifyLocation } = usePermissions();
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(initialLocations);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [selectedQrID, setSelectedQrID] = useState<string | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    setPage(0);

    // Filter locations based on search query
    const filtered = initialLocations.filter((location) => {
      return (
        location.qrID?.toLowerCase().includes(searchValue) ||
        location.buildingName.toLowerCase().includes(searchValue) ||
        location.building.toLowerCase().includes(searchValue) ||
        location.room.toLowerCase().includes(searchValue)
      );
    });

    setFilteredLocations(filtered);
  };

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

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmitForm = async (formData: FormData) => {
    const result = await addLocationAction(formData);
    if (!result.error) {
      setSnackbarMessage('Location added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      setSnackbarMessage(`Error: ${result.error}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (locationID: number) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    const response = await deleteLocationAction(locationID);

      if (response.error) {
        setSnackbarMessage(`Error deleting location: ${response.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Location deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        router.refresh();
      }
  };

  const handleQRCodeModalOpen = (qrID: string | null | undefined) => {
    if (qrID) {
      setSelectedQrID(qrID);
      setIsQrCodeModalOpen(true);
    }
  };
  
  const handleQRCodeModalClose = () => {
    setIsQrCodeModalOpen(false);
    setSelectedQrID(null);
  };

  return (
    <>
      <MainCard>
        <CardContent>
          {/* Search & Add Button Container */}
          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
            {/* Search Bar */}
            <Grid item xs={12} sm={6}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search Location"
                value={search}
                onChange={handleSearch}
                size="small"
              />
            </Grid>

            {/* Filter & Add Buttons */}
            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              {canModifyLocation && (
                <Tooltip title="Add Location">
                  <Fab
                    color="primary"
                    size="small"
                    onClick={handleOpenAddModal}
                    sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </CardContent>

        {/* Table Container */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>QR ID</TableCell>
                <TableCell>Building Name</TableCell>
                <TableCell>Building Code</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Total Chemicals</TableCell>
                <TableCell sx={{ textAlign: 'left', width: '10%', paddingRight: 4 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((location) => (
                <TableRow key={location.locationID}>
                  <TableCell>
                    {location.qrID || 'N/A'}
                    <IconButton
                      onClick={() => handleQRCodeModalOpen(location.qrID)}
                      title="View QR Code"
                    >   
                      <InfoIcon sx={{fontSize: '16px'}}/>
                    </IconButton>
                  </TableCell>
                  <TableCell>{location.buildingName}</TableCell>
                  <TableCell>{location.building}</TableCell>
                  <TableCell>{location.room}</TableCell>
                  <TableCell>{location.totalChemicals}</TableCell>
                  <TableCell sx={{ width: '10%', paddingRight: 4 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Location Information">
                        <Link href={`/location-page/${location.qrID}`} passHref>
                          <IconButton title="View Details">
                            <VisibilityTwoToneIcon />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="View Chemicals">
                        <Link href={`/location-page/${location.qrID}/chemicals`} passHref>
                          <IconButton>
                            <FormatListBulletedIcon />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      {canModifyLocation && (
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(location.locationID)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLocations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>

      {/* Add Location Modal */}
      <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add Location">
        <LocationForm open={isAddModalOpen} onSubmit={handleSubmitForm} onCancel={handleCloseAddModal} />
      </AddFormModal>

      <QrCodeModal
        open={isQrCodeModalOpen}
        qrID={selectedQrID || ''}
        onClose={handleQRCodeModalClose}
        type="location"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LocationPage;

