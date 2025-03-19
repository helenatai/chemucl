'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Grid, DialogContent } from '@mui/material';

interface LocationFormProps {
  open: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState({
    qrID: '',
    buildingName: '',
    building: '',
    room: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // Manually append each field
    formData.append('qrID', formValues.qrID);
    formData.append('buildingName', formValues.buildingName);
    formData.append('building', formValues.building);
    formData.append('room', formValues.room);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent
        sx={{
          maxHeight: '500px', // optional fixed height for scrolling
          overflowY: 'auto',  // enable vertical scrolling
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="QR ID"
              name="qrID"
              value={formValues.qrID}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              label="Building Name"
              name="buildingName"
              value={formValues.buildingName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              label="Building Code"
              name="building"
              value={formValues.building}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              label="Room"
              name="room"
              value={formValues.room}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onCancel} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Box>
      </DialogContent>
    </form>
  );
};

export default LocationForm;
