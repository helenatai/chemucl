'use client';

import React, { useState, useMemo } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
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

const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, onCancel, initialLocations }) => {
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocationRow[]>([{ buildingName: '', room: '' }]);

  const uniqueBuildings = useMemo(() => {
    return Array.from(new Set(initialLocations.map((loc) => loc.buildingName.trim())));
  }, [initialLocations]);

  const addLocationRow = () => {
    setSelectedLocations([...selectedLocations, { buildingName: '', room: '' }]);
  };

  const handleBuildingChange = (index: number, newValue: string | null) => {
    const updated = [...selectedLocations];
    updated[index].buildingName = newValue || '';
    updated[index].room = ''; // reset room when building changes
    setSelectedLocations(updated);
  };

  const handleRoomChange = (index: number, newValue: string | null) => {
    const updated = [...selectedLocations];
    updated[index].room = newValue || '';
    setSelectedLocations(updated);
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Validate that every row has a building and room selected.
  //   for (const row of selectedLocations) {
  //     if (!row.buildingName || !row.room) {
  //       alert('Please select both building and room for every row.');
  //       return;
  //     }
  //   }
  //   // Map each row to a locationID by finding a matching record.
  //   const result: { locationID: number }[] = [];
  //   for (const row of selectedLocations) {
  //     const matchingLocation = initialLocations.find(loc =>
  //       loc.buildingName.trim().toLowerCase() === row.buildingName.trim().toLowerCase() &&
  //       loc.room.trim().toLowerCase() === row.room.trim().toLowerCase()
  //     );
  //     if (!matchingLocation) {
  //       alert(`No location found for building: ${row.buildingName} and room: ${row.room}`);
  //       return;
  //     }
  //     result.push({ locationID: matchingLocation.locationID });
  //   }
  //   onSubmit(result);
  // };

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
      <Grid container spacing={2}>
        {selectedLocations.map((row, index) => {
          // For each row, filter the room options based on the selected building.
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
            <Grid container item spacing={2} key={index}>
              <Grid item xs={6}>
                <Autocomplete
                  options={uniqueBuildings}
                  value={row.buildingName}
                  onChange={(event: React.SyntheticEvent<Element, Event>, newValue: string | null) => handleBuildingChange(index, newValue)}
                  renderInput={(params) => <TextField {...params} label="Building" required />}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={roomOptions}
                  value={row.room}
                  onChange={(event: React.SyntheticEvent<Element, Event>, newValue: string | null) => handleRoomChange(index, newValue)}
                  renderInput={(params) => <TextField {...params} label="Room" required />}
                  disabled={!row.buildingName}
                />
              </Grid>
            </Grid>
          );
        })}
      </Grid>
      <Box mt={2}>
        <Button onClick={addLocationRow}>Add New Location</Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={onCancel} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default AuditForm;
