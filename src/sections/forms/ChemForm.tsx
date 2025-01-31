'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  SelectChangeEvent,
  DialogContent,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import { validateAndProcessResearchGroup } from 'services/research-group/researchGroupActionHandler';
import { validateAndProcessLocation } from 'services/location/locationActionHandler';

interface ChemFormProps {
  open: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

interface Owner {
  researchGroupID: number;
  groupName: string;
}

interface Location {
  locationID: number;
  building: string;
  room: string;
}

const ChemForm: React.FC<ChemFormProps> = ({ onSubmit, onCancel }) => {
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
    description: '',
  });

  const [owners, setOwners] = useState<Owner[]>([]);
  const [locations, setLocations] = useState<Array<{ locationID: number; building: string; room: string }>>([]);


  // Fetch research groups (owners)
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await validateAndProcessResearchGroup('find', {});
        if (!response.error && response.researchGroups) {
          setOwners(response.researchGroups);
        } else {
          console.error('Error fetching research groups:', response.error);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };

    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await validateAndProcessLocation('find', {});
        if (!response.error && response.locations) {
          setLocations(response.locations);
        } else {
          console.error('Error fetching locations:', response.error);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
  
    fetchLocations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Trigger the CAS lookup if necessary
    if (name === 'casNumber' || name === 'chemicalName') {
      handleCASOrNameLookup(name, value);
    }
  };



  // const handleCASOrNameLookup = async (key: string) => {
  //   const query = formValues[key as keyof typeof formValues];
  //   if (!query) return;

  //   try {
  //     const response = await fetch(
  //       `https://commonchemistry.cas.org/api/search?q=${encodeURIComponent(query)}`
  //     );
  //     const data = await response.json();

  //     if (data.results?.length > 0) {
  //       const result = data.results[0];
  //       if (key === 'casNumber') {
  //         setFormValues((prev) => ({ ...prev, chemicalName: result.name }));
  //       } else if (key === 'chemicalName') {
  //         setFormValues((prev) => ({ ...prev, casNumber: result.casNumber }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching CAS data:', error);
  //   }
  // };

  const handleCASOrNameLookup = async (key: string, value: string) => {
    if (!value) return; // Exit if the value is empty
  
    try {
      const response = await fetch(
        `https://commonchemistry.cas.org/api/search?q=${encodeURIComponent(value)}`
      );
      const data = await response.json();
  
      if (data.results?.length > 0) {
        const result = data.results[0];
        if (key === 'casNumber') {
          setFormValues((prev) => ({
            ...prev,
            chemicalName: result.name, // Autofill chemical name
          }));
        } else if (key === 'chemicalName') {
          setFormValues((prev) => ({
            ...prev,
            casNumber: result.casNumber, // Autofill CAS number
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching CAS data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.owner) {
      alert("Please select an owner.");
      return;
    }

    if (!formValues.location) {
      alert('Please select a location.');
      return;
    }
  
    const formData = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value ? value.toString() : '');
    });

    formData.append('researchGroupID', formValues.owner.researchGroupID.toString());
    formData.append('locationID', formValues.location.locationID.toString()); 
  
  
    onSubmit(formData);
  };

return (
  <form onSubmit={handleSubmit}>
      <DialogContent
        sx={{
          maxHeight: '500px', // Set fixed height for the modal content
          overflowY: 'auto', // Enable vertical scrolling
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
              sx={ {marginBottom: 2.5}}
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
                    owner: newValue,
                  }))
                }
                renderInput={(params) => <TextField {...params} label="Select Owner" required />}
                sx={{ marginBottom: 1.5 }}
              />
            </Grid>
          <Grid item xs={12}>
          <Autocomplete
            options={[
              'Chemical',
              'Poisons',
              'Explosives',
              'Chemical Weapon',
              'Pyrophorics',
              'Drug Precursor',
              'Other'
            ]}
            value={formValues.chemicalType || null}
            onChange={(event, newValue) =>
              setFormValues((prev) => ({
                ...prev,
                chemicalType: newValue || '', // Ensures proper type assignment
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
                    room: newValue?.room || '',
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
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Room"
              name="room"
              value={formValues.room}
              onChange={handleChange}
            />
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
  </form>
  );
};

export default ChemForm;
