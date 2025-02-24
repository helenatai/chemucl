'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Autocomplete from '@mui/material/Autocomplete';
import { ChemicalWithRelations } from 'types/chemical';
import { validateAndProcessLocation } from 'services/location/locationActionHandler';
import { validateAndProcessChemical } from 'services/chemical/chemicalActionHandler';

// Material UI Imports
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
//import Card from '@mui/material/Card';
//import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
//import Breadcrumbs from '@mui/material/Breadcrumbs';
//import Link from 'next/link';

// Project Imports
import SubCard from 'components/ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const ChemicalInformation = ({ chemical }: { chemical: ChemicalWithRelations }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editedChemical, setEditedChemical] = useState({ ...chemical }); 
  const [buildings, setBuildings] = useState<string[]>([]); 
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    if (chemical.qrID) {
      const canvas = canvasRef.current;
      if (canvas) {
        QRCode.toCanvas(canvas, chemical.qrID, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 150,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        }).catch((err) => console.error('QR Code Generation Error:', err));
      }
    }
  }, [chemical.qrID]);

  useEffect(() => {
    const fetchBuildings = async () => {
      const result = await validateAndProcessLocation('find', {});
      if (!result.error) {
        setBuildings(result.locations?.map((loc: any) => loc.building) ?? []);
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (editedChemical.location?.building) {
      const fetchRooms = async () => {
        const result = await validateAndProcessLocation('find', {
          building: editedChemical.location?.building ?? "",
        });
        if (!result.error) {
          setRooms(result.locations?.map((loc: any) => loc.room) ?? []);
        }
      };
      fetchRooms();
    }
  }, [editedChemical.location?.building]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setEditedChemical({
      ...editedChemical,
      [name]: name === "quantity" ? Number(value) : value, 
    });
  };

  const handleSave = async () => {
    console.log("Submitting Update Request with Data:", editedChemical);
    try {
      const result = await validateAndProcessChemical('update', {
        chemicalID: editedChemical.chemicalID, 
        chemicalName: editedChemical.chemicalName,
        casNumber: editedChemical.casNumber || null,
        chemicalType: editedChemical.chemicalType,
        restrictionStatus: editedChemical.restrictionStatus,
        supplier: editedChemical.supplier || null,
        description: editedChemical.description || null,
        quantity: Number(editedChemical.quantity),
        subLocation1: editedChemical.subLocation1 || null,
        subLocation2: editedChemical.subLocation2 || null,
        subLocation3: editedChemical.subLocation3 || null,
        subLocation4: editedChemical.subLocation4 || null,
        locationID: editedChemical.location?.locationID || null, 
      });

      console.log("API Response:", result);
  
      if (result?.chemicals) {
        alert('Chemical information updated successfully!');
        setIsEditing(false);
      } else {
        alert(result?.error || 'Failed to update chemical information.');
      }
    } catch (error) {
      console.error('Error updating chemical:', error);
      alert('An error occurred while updating the chemical.');
    }
  };
  
  return (
    <Grid container spacing={gridSpacing}>

      {/* QR Code & Chemical Information */}
      <Grid item xs={12}>
        <SubCard title={chemical.qrID}>
          <Grid container spacing={gridSpacing}>
            {/* QR Code */}
            <Grid item sm={6} md={3}>
              <SubCard title="QR Code" contentSX={{ textAlign: 'center' }}>
                <canvas ref={canvasRef} style={{ width: '150px', height: '150px' }} />
                <Typography variant="h4">{chemical.qrID}</Typography>
              </SubCard>
            </Grid>

            {/* Chemical Information */}
            <Grid item sm={6} md={9}>
              <SubCard title="Chemical Information">
                <Grid container spacing={gridSpacing}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth 
                    label="Item Name" 
                    name="chemicalName" 
                    value={editedChemical.chemicalName} 
                    onChange={handleInputChange} 
                    InputProps={{ readOnly: !isEditing }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth 
                    label="Cas No." 
                    name="casNumber" 
                    value={editedChemical.casNumber || 'N/A'} 
                    onChange={handleInputChange} 
                    InputProps={{ readOnly: !isEditing }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth 
                    label="Quantity" 
                    name="quantity" 
                    value={editedChemical.quantity} 
                    onChange={handleInputChange} 
                    InputProps={{ readOnly: !isEditing }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      options={[
                        "Chemical",
                        "Poison",
                        "Explosive",
                        "Chemical Weapon",
                        "Pyrophoric",
                        "Drug Precursor",
                        "Other",
                      ]}
                      value={editedChemical.chemicalType}
                      onChange={(event, newValue) =>
                        setEditedChemical({ ...editedChemical, chemicalType: newValue || "" })
                      }
                      disableClearable={!isEditing} // Prevents clearing when not editing
                      readOnly={!isEditing} // Disables typing when not in edit mode
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Type"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            readOnly: !isEditing, // Disables manual text entry when not in edit mode
                            endAdornment: isEditing ? params.InputProps.endAdornment : null, // Hides dropdown arrow when not editing
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={["Unrestricted", "Restricted"]}
                        value={editedChemical.restrictionStatus ? "Restricted" : "Unrestricted"}
                        onChange={(_, newValue) => setEditedChemical({ ...editedChemical, restrictionStatus: newValue === "Restricted" })}
                        disableClearable={!isEditing}
                        renderInput={(params) => (
                          <TextField {...params} label="Restricted Status" InputProps={{ ...params.InputProps, readOnly: !isEditing, endAdornment: isEditing ? params.InputProps.endAdornment : null }} />
                        )}
                      />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Owner" value={chemical.researchGroup?.groupName || 'N/A'} InputProps={{ readOnly: !isEditing }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Supplier" name="supplier" value={editedChemical.supplier || 'N/A'} onChange={handleInputChange} InputProps={{ readOnly: !isEditing }} />
                  </Grid>
                </Grid>
              </SubCard>
            </Grid>

            <Grid item xs={12} container spacing={gridSpacing} sx={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Safety Information */}
              <Grid item sm={6} md={3} sx={{ display: 'flex' }}>
                <SubCard title="Safety Information" contentSX={{ height: '100%' }} sx={{ flex: 1 }}>
                  <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                    <TextField fullWidth label="Safety Information" name="description" value={editedChemical.description} onChange={handleInputChange} InputProps={{ readOnly: !isEditing }} multiline minRows={6} />
                    </Grid>
                  </Grid>
                </SubCard>
              </Grid>

              {/* Location Information */}
              <Grid item sm={6} md={9} sx={{ display: 'flex' }}>
                <SubCard title="Location" contentSX={{ height: '100%' }} sx={{ flex: 1 }}>
                  <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={buildings}
                        value={editedChemical.location?.building ?? ""}
                        onChange={(_, newValue) => setEditedChemical({
                          ...editedChemical,
                          location: {
                            ...(editedChemical.location ?? {}), 
                            locationID: editedChemical.location?.locationID ?? 0, 
                            building: newValue ?? "",
                            room: editedChemical.location?.room ?? ""
                          }
                        })}
                        disableClearable={!isEditing}
                        renderInput={(params) => (
                          <TextField {...params} label="Building Name" InputProps={{ ...params.InputProps, readOnly: !isEditing, endAdornment: isEditing ? params.InputProps.endAdornment : null }} />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Building Code" value={chemical.location?.buildingCode || 'N/A'} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                          options={rooms}
                          value={editedChemical.location?.room || ""}
                          onChange={(_, newValue) => setEditedChemical({
                            ...editedChemical,
                            location: {
                              ...(editedChemical.location ?? {}), 
                              locationID: editedChemical.location?.locationID ?? 0, 
                              building: editedChemical.location?.building ?? "",
                              room: newValue ?? ""
                            }
                          })}
                          disableClearable={!isEditing}
                          renderInput={(params) => (
                            <TextField {...params} label="Room" InputProps={{ ...params.InputProps, readOnly: !isEditing, endAdornment: isEditing ? params.InputProps.endAdornment : null }} />
                          )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Sublocation 1" 
                      name="subLocation1"
                      value={editedChemical.subLocation1 || 'N/A'} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Sublocation 2" 
                      name="subLocation2"
                      value={editedChemical.subLocation2 || 'N/A'} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing }}  
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Sublocation 3" 
                      name="subLocation3"
                      value={editedChemical.subLocation3 || 'N/A'} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing }}  
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Sublocation 4" 
                      name="subLocation4"
                      value={editedChemical.subLocation4 || 'N/A'} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing }} 
                      />
                    </Grid>
                  </Grid>
                </SubCard>
              </Grid>
            </Grid>
          </Grid>
        </SubCard>
      </Grid>

      {/* Edit Button */}
      <Grid item xs={12} sx={{ textAlign: 'right' }}>
        <Stack direction="row" justifyContent="flex-end">
          {isEditing ? (
            <Button variant="contained" onClick={handleSave}>Save</Button>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ChemicalInformation;


