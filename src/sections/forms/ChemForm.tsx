'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Grid } from '@mui/material';

interface ChemFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

const ChemForm: React.FC<ChemFormProps> = ({ onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState({
    chemicalName: '',
    casNumber: '',
    qrID: '',
    supplier: '',
    chemicalType: '',
    quantity: '',
    quartzyNumber: '',
    researchGroup: '',
    locationID: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value);
    });
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Chemical Name"
              name="chemicalName"
              value={formValues.chemicalName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="CAS Number"
              name="casNumber"
              value={formValues.casNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="QR ID"
              name="qrID"
              value={formValues.qrID}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location ID"
              name="locationID"
              value={formValues.locationID}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Chemical Type"
              name="chemicalType"
              value={formValues.chemicalType}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Supplier"
              name="supplier"
              value={formValues.supplier}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              value={formValues.quantity}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button onClick={onCancel} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default ChemForm;
