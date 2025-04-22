'use client';

import React, { useState } from 'react';
import { Grid, TextField, DialogContent, Box, Button } from '@mui/material';

interface ResearchGroupFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const ResearchGroupForm: React.FC<ResearchGroupFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formValues, setFormValues] = useState({
    groupName: '',
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

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={1}>
          {/* Group Name */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              margin="dense"
              label="Group Name"
              name="groupName"
              value={formValues.groupName}
              onChange={handleChange}
              autoComplete="off"
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

export default ResearchGroupForm; 