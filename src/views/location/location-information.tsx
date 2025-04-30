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
import { updateLocationAction } from 'actions/location/server-actions/updateLocation';

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
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // For Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  useEffect(() => {
    const qrID = isEditing ? editedLocation.qrID : location.qrID;
    if (qrID && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrID, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 150,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch((err) => console.error('QR Code Generation Error:', err));
    }
  }, [isEditing, editedLocation.qrID, location.qrID]);

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setEditedLocation((prev) => ({ ...prev, [name]: value }));
  };

  const validateQrId = (qrId: string): string | null => {
    if (!qrId.match(/^\d{3}-\d{3,4}$/)) {
      return 'QR ID must be in format: XXX-XXXX where X are numbers';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qrIdError = validateQrId(editedLocation.qrID);
    if (qrIdError) {
      setSnackbarMessage(qrIdError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const fieldChanges = [];
    if (editedLocation.building !== location.building) {
      fieldChanges.push('building code');
    }
    if (editedLocation.buildingName !== location.buildingName) {
      fieldChanges.push('building name');
    }
    if (editedLocation.room !== location.room) {
      fieldChanges.push('room number');
    }

    if (fieldChanges.length > 0 && editedLocation.qrID === location.qrID && !hasShownWarning) {
      setSnackbarMessage(
        `Warning: You've changed ${fieldChanges.join(', ')}. Please verify if the QR ID needs to be updated to match the new values.`
      );
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setHasShownWarning(true);
      return;
    }

    try {
      const result = await updateLocationAction({
        ...editedLocation,
        locationID: location.locationID
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setSnackbarMessage('Location updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsEditing(false);
      setHasShownWarning(false);

      setTimeout(() => {
        router.push('/location-page');
      }, 1500);
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to update location');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    setEditedLocation({ ...location });
    setIsEditing(false);
    setHasShownWarning(false);
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
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="QR ID"
                        name="qrID"
                        value={editedLocation.qrID}
                        onChange={(e) => handleInputChange('qrID', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        error={!!validateQrId(editedLocation.qrID)}
                      />
                      {isEditing && (
                        <Stack spacing={1} sx={{ mt: 1, pl: 1.5 }}>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <strong>Note:</strong>
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
                            • Please ensure QR ID matches the building name, building code and room number
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
                            • If QR ID is modified, previously saved or printed QR codes for this location will no longer work
                          </Typography>
                        </Stack>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Building Name"
                        name="buildingName"
                        value={editedLocation.buildingName}
                        onChange={(e) => handleInputChange('buildingName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Building Code"
                        name="building"
                        value={editedLocation.building}
                        onChange={(e) => handleInputChange('building', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Room"
                        name="room"
                        value={editedLocation.room}
                        onChange={(e) => handleInputChange('room', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                  </Grid>
                </SubCard>
              </Grid>
            </Grid>
          </SubCard>
        </Grid>

        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {isEditing && canModifyLocation ? (
              <>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
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
