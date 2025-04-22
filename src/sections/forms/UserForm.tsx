'use client';

import React, { useState } from 'react';
import { Grid, TextField, DialogContent, Box, Button } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { ROLES } from 'constants/roles';

interface UserFormProps {
  open: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  initialResearchGroups: {
    researchGroupID: number;
    groupName: string;
  }[];
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onSubmit,
  onCancel,
  initialResearchGroups,
}) => {
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    role: '',
    researchGroupID: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value);
    });
    onSubmit(formData);
  };

  const roleOptions = [
    { value: ROLES.ADMIN, label: 'Admin' },
    { value: ROLES.STAFF, label: 'Staff' },
    { value: ROLES.RESEARCH_STUDENT, label: 'Research Student' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={1}>
          {/* Full Name */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              margin="dense"
              label="Full Name"
              name="fullName"
              value={formValues.fullName}
              onChange={handleChange}
              autoComplete="name"
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              margin="dense"
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </Grid>

          {/* User Role */}
          <Grid item xs={12}>
            <Autocomplete
              options={roleOptions}
              getOptionLabel={(option) => option.label}
              value={roleOptions.find(option => option.value === formValues.role) || null}
              onChange={(_, newValue) => {
                setFormValues(prev => ({
                  ...prev,
                  role: newValue ? newValue.value : ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  margin="dense"
                  label="User Role"
                />
              )}
            />
          </Grid>

          {/* Research Group */}
          <Grid item xs={12}>
            <Autocomplete
              options={initialResearchGroups}
              getOptionLabel={(option) => option.groupName}
              value={initialResearchGroups.find(group => group.researchGroupID.toString() === formValues.researchGroupID) || null}
              onChange={(_, newValue) => {
                setFormValues(prev => ({
                  ...prev,
                  researchGroupID: newValue ? newValue.researchGroupID.toString() : ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  margin="dense"
                  label="Research Group"
                />
              )}
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
    </form>
  );
};

export default UserForm; 