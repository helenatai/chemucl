'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Grid, DialogContent, Snackbar, Alert } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

interface ChemFormProps {
  open: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  initialLocations: { locationID: number; building: string; room: string; buildingName: string }[];
  initialResearchGroups: { researchGroupID: number; groupName: string }[];
}

interface Owner {
  researchGroupID: number;
  groupName: string;
}

interface Location {
  locationID: number;
  building: string;
  room: string;
  buildingName: string;
}

const ChemForm: React.FC<ChemFormProps> = ({ onSubmit, onCancel, initialLocations, initialResearchGroups }) => {
  const [formValues, setFormValues] = useState({
    qrID: '',
    quantity: '',
    casNumber: '',
    chemicalName: '',
    quartzyNumber: '',
    supplier: '',
    owner: null as Owner | null,
    chemicalType: '',
    location: null as Location | null,
    building: '',
    room: '',
    subLocation1: '',
    subLocation2: '',
    subLocation3: '',
    subLocation4: '',
    description: ''
  });

  const [owners] = useState<Owner[]>(initialResearchGroups);
  const [locations] = useState<Location[]>(initialLocations);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.owner) {
      setSnackbarMessage('Please select an owner.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!formValues.location) {
      setSnackbarMessage('Please select a location.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const formData = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value ? value.toString() : '');
    });
    formData.append('researchGroupID', formValues.owner.researchGroupID.toString());
    formData.append('locationID', formValues.location.locationID.toString());
    formData.append('subLocation1', formValues.subLocation1 || '');
    formData.append('subLocation2', formValues.subLocation2 || '');
    formData.append('subLocation3', formValues.subLocation3 || '');
    formData.append('subLocation4', formValues.subLocation4 || '');

    try {
      await onSubmit(formData);
      setSnackbarMessage('Chemical saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error saving chemical. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCASOrNameLookup = async (key: string, value: string) => {
    if (!value) return; // Exit if the value is empty

    try {
      const response = await fetch(`https://commonchemistry.cas.org/api/search?q=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (data.results?.length > 0) {
        const result = data.results[0];
        if (key === 'casNumber') {
          setFormValues((prev) => ({
            ...prev,
            chemicalName: result.name // Autofill chemical name
          }));
        } else if (key === 'chemicalName') {
          setFormValues((prev) => ({
            ...prev,
            casNumber: result.casNumber // Autofill CAS number
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching CAS data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent
        sx={{
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="QR ID"
              name="qrID"
              value={formValues.qrID}
              onChange={handleChange}
              type="string"
              required
              placeholder="e.g. AAA25"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Quantity"
              name="quantity"
              value={formValues.quantity}
              onChange={handleChange}
              type="number"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="CAS Number"
              name="casNumber"
              value={formValues.casNumber}
              onChange={(e) => {
                const { value } = e.target;
                handleChange(e);
                handleCASOrNameLookup('casNumber', value);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Chemical Name"
              name="chemicalName"
              value={formValues.chemicalName}
              onChange={(e) => {
                const { value } = e.target;
                handleChange(e);
                handleCASOrNameLookup('casNumber', value);
              }}
              type="string"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Quartzy Number"
              name="quartzyNumber"
              value={formValues.quartzyNumber}
              onChange={handleChange}
              type="string"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Supplier"
              name="supplier"
              value={formValues.supplier}
              onChange={handleChange}
              type="string"
              sx={{ marginBottom: 2.5 }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Autocomplete
              options={owners}
              getOptionLabel={(option) => option.groupName}
              value={formValues.owner}
              onChange={(event, newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  owner: newValue
                }))
              }
              renderInput={(params) => <TextField {...params} label="Select Owner" required />}
              sx={{ marginBottom: 1.5 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={['Chemical', 'Poisons', 'Explosives', 'Chemical Weapon', 'Pyrophorics', 'Drug Precursor', 'Other']}
              value={formValues.chemicalType || null}
              onChange={(event, newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  chemicalType: newValue || '' // Ensures proper type assignment
                }))
              }
              renderInput={(params) => <TextField {...params} label="Select Chemical Type" required />}
              sx={{ marginBottom: 1.5 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => `${option.building} | ${option.room}`}
              value={formValues.location}
              onChange={(event, newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  location: newValue,
                  building: newValue?.building || '',
                  room: newValue?.room || ''
                }))
              }
              renderInput={(params) => <TextField {...params} label="Select Existing Location" required />}
              sx={{ marginBottom: 0.5 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Building"
              name="building"
              value={formValues.building}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField autoFocus fullWidth margin="dense" label="Room" name="room" value={formValues.room} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Sub-location 1"
              name="subLocation1"
              value={formValues.subLocation1}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Sub-location 2"
              name="subLocation2"
              value={formValues.subLocation2}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Sub-location 3"
              name="subLocation3"
              value={formValues.subLocation3}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Sub-location 4"
              name="subLocation4"
              value={formValues.subLocation4}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Safety Information"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onCancel} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </DialogContent>
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
    </form>
  );
};

export default ChemForm;
