'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';
import { usePermissions } from 'hooks/usePermissions';

// MUI imports
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Project imports
import SubCard from 'components/ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';
// import { updateLocationAction } from 'actions/location/server-actions/updateLocation';
// etc.

interface LocationWithRelations {
  locationID: number;
  qrID: string;
  building: string;
  buildingName: string;
  room: string;
  // possibly totalChemicals, subLocation fields, etc.
}

const LocationInformation = ({ location }: { location: LocationWithRelations }) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canModifyLocation } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [editedLocation, setEditedLocation] = useState({ ...location });

  // For Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (location.qrID) {
      // Generate the QR code
      QRCode.toCanvas(canvasRef.current, location.qrID, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 150,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(err => console.error('QR Code Generation Error:', err));
    }
  }, [location.qrID]);

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // For any input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedLocation((prev) => ({ ...prev, [name]: value }));
  };

  // For saving changes (similar to how you did with chemicals)
  const handleSave = async () => {
    try {
      setSnackbarMessage('Location updated successfully (simulation)!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        router.push('/location-page'); // or wherever
      }, 1500);

    } catch (error) {
      console.error('Error updating location:', error);
      setSnackbarMessage('An error occurred while updating the location.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    setEditedLocation({...location}); 
    setIsEditing(false);
  };

  return (
    <>
      <Grid container spacing={gridSpacing}>
        {/* QR Code & Basic Info */}
        <Grid item xs={12}>
          <SubCard title={location.qrID}>
            <Grid container spacing={gridSpacing}>
              {/* QR Code */}
              <Grid item sm={6} md={3}>
                <SubCard title="QR Code" contentSX={{ textAlign: 'center' }}>
                  <canvas ref={canvasRef} style={{ width: '150px', height: '150px' }} />
                  <Typography variant="h4">{location.qrID}</Typography>
                </SubCard>
              </Grid>

              {/* Location Information */}
              <Grid item sm={6} md={9}>
                <SubCard title="Location Information">
                  <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                      <TextField 
                        fullWidth 
                        label="Building Name" 
                        name="buildingName"
                        value={editedLocation.buildingName} 
                        onChange={handleInputChange}
                        InputProps={{ readOnly: !isEditing || !canModifyLocation }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Building Code" 
                        name="building"
                        value={editedLocation.building} 
                        onChange={handleInputChange}
                        InputProps={{ readOnly: !isEditing || !canModifyLocation }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Room"
                        name="room"
                        value={editedLocation.room} 
                        onChange={handleInputChange}
                        InputProps={{ readOnly: !isEditing || !canModifyLocation }} 
                      />
                    </Grid>
                    {/* ...any additional fields, e.g. subLocation1, subLocation2, etc. */}
                  </Grid>
                </SubCard>
              </Grid>
            </Grid>
          </SubCard>
        </Grid>

        {/* Button Row */}
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {isEditing && canModifyLocation ? (
              <>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : canModifyLocation ? (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

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

export default LocationInformation;
