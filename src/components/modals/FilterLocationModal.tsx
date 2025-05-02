'use client';

import React, { useState } from 'react';
import { Modal, Box, Button, Stack, Chip, IconButton, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import MainCard from 'ui-component/cards/MainCard';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

interface FilterLocationModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  locations: { buildingName: string; building: string; room: string }[];
  currentFilters: FilterState;
}

export interface FilterState {
  buildingNames: string[];
  rooms: string[];
}

const FilterLocationModal: React.FC<FilterLocationModalProps> = ({ open, onClose, onApplyFilters, locations, currentFilters }) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleClearFilters = () => {
    const emptyFilters: FilterState = {
      buildingNames: [],
      rooms: []
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Extract unique values for filter options
  const uniqueBuildingNames = Array.from(new Set(locations.map((loc) => loc.buildingName)));
  const uniqueRooms = Array.from(new Set(locations.map((loc) => loc.room)));

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
          title="Filter Locations"
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
                options={uniqueBuildingNames}
                value={filters.buildingNames}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, buildingNames: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Building Name" margin="dense" />}
              />

              <Autocomplete
                multiple
                options={uniqueRooms}
                value={filters.rooms}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, rooms: newValue }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" label="Filter by Room" margin="dense" />}
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

export default FilterLocationModal;
