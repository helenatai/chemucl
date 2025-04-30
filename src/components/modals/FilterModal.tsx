'use client';

import React, { useState } from 'react';
import { Modal, Box, Button, Stack, Chip, IconButton, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import MainCard from 'ui-component/cards/MainCard';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  locations: { building: string; room: string }[];
  chemicalTypes: string[];
  owners: string[];
  suppliers: string[];
  currentFilters: FilterState;
}

export interface FilterState {
  locations: string[];
  chemicalTypes: string[];
  owners: string[];
  suppliers: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApplyFilters,
  locations,
  chemicalTypes,
  owners,
  suppliers,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleClearFilters = () => {
    const emptyFilters: FilterState = {
      locations: [],
      chemicalTypes: [],
      owners: [],
      suppliers: []
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const uniqueLocations = locations.map((loc) => `${loc.building} ${loc.room}`);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <MainCard
          title="Filter Chemicals"
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
              <Autocomplete
                multiple
                options={uniqueLocations}
                value={filters.locations}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, locations: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Location" margin="dense" />}
              />

              <Autocomplete
                multiple
                options={chemicalTypes}
                value={filters.chemicalTypes}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, chemicalTypes: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Chemical Type" margin="dense" />}
              />

              <Autocomplete
                multiple
                options={owners}
                value={filters.owners}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, owners: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Owner" margin="dense" />}
              />

              <Autocomplete
                multiple
                options={suppliers}
                value={filters.suppliers}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, suppliers: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Supplier" margin="dense" />}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                  Clear Filters
                </Button>
                <Box>
                  <Button onClick={onClose} sx={{ mr: 1 }}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyFilters} variant="contained">
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default FilterModal;
