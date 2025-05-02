'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Button, TextField, Stack } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { LocationWithRelations } from 'types/location';

interface AuditFormProps {
  onSubmit: (selectedLocations: { buildingName: string; room: string }[]) => void;
  onCancel: () => void;
  initialLocations: LocationWithRelations[];
}

interface SelectedLocationRow {
  buildingName: string;
  room: string;
}

const MOBILE_THRESHOLD = 600; // Width threshold in pixels

const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, onCancel, initialLocations }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocationRow[]>([{ buildingName: '', room: '' }]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_THRESHOLD);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const uniqueBuildings = useMemo(() => {
    return Array.from(new Set(initialLocations.map((loc) => loc.buildingName.trim())));
  }, [initialLocations]);

  const addLocationRow = () => {
    setSelectedLocations([...selectedLocations, { buildingName: '', room: '' }]);
  };

  const handleBuildingChange = (index: number, newValue: string | null) => {
    const updated = [...selectedLocations];
    updated[index].buildingName = newValue || '';
    updated[index].room = '';
    setSelectedLocations(updated);
  };

  const handleRoomChange = (index: number, newValue: string | null) => {
    const updated = [...selectedLocations];
    updated[index].room = newValue || '';
    setSelectedLocations(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const row of selectedLocations) {
      if (!row.buildingName || !row.room) {
        alert('Please select both building and room for every row.');
        return;
      }
    }
    onSubmit(selectedLocations);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {selectedLocations.map((row, index) => {
          const roomOptions = row.buildingName
            ? Array.from(
                new Set(
                  initialLocations
                    .filter((loc) => loc.buildingName.trim().toLowerCase() === row.buildingName.trim().toLowerCase())
                    .map((loc) => loc.room)
                )
              )
            : [];
          return (
            <Stack key={index} direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ width: '100%' }}>
              <Box sx={{ width: isMobile ? '100%' : '50%' }}>
                <Autocomplete
                  options={uniqueBuildings}
                  value={row.buildingName}
                  onChange={(event: React.SyntheticEvent<Element, Event>, newValue: string | null) => handleBuildingChange(index, newValue)}
                  renderInput={(params) => <TextField {...params} label="Building" required />}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ width: isMobile ? '100%' : '50%' }}>
                <Autocomplete
                  options={roomOptions}
                  value={row.room}
                  onChange={(event: React.SyntheticEvent<Element, Event>, newValue: string | null) => handleRoomChange(index, newValue)}
                  renderInput={(params) => <TextField {...params} label="Room" required />}
                  disabled={!row.buildingName}
                  fullWidth
                  size="small"
                />
              </Box>
            </Stack>
          );
        })}
      </Stack>
      <Box mt={2}>
        <Button onClick={addLocationRow} size="small">
          Add New Location
        </Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={onCancel} sx={{ mr: 2 }} size="small">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" size="small">
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default AuditForm;
