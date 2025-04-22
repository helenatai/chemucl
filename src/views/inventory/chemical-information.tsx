'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Autocomplete from '@mui/material/Autocomplete';
import { updateChemicalAction } from 'actions/chemical/server-actions/updateChemical';
import { ChemicalWithRelations } from 'types/chemical';
import { useRouter } from 'next/navigation';
import { usePermissions } from 'hooks/usePermissions';

// Material UI Imports
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Project Imports
import SubCard from 'components/ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

interface ChemicalInformationProps {
  chemical: ChemicalWithRelations;
  locations: {
    locationID: number;
    qrID: string;
    building: string;
    buildingName: string;
    room: string;
  }[];
  researchGroups: {
    researchGroupID: number;
    groupName: string;
  }[];
}

const ChemicalInformation: React.FC<ChemicalInformationProps> = ({ chemical, locations, researchGroups }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedChemical, setEditedChemical] = useState({ ...chemical });
  const [buildings, setBuildings] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const router = useRouter();
  const { canModifyInventory } = usePermissions();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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
    const uniqueBuildingNames = Array.from(
      new Set(locations.map(loc => loc.buildingName.trim()))
    );
    setBuildings(uniqueBuildingNames);
  }, [locations]);

  useEffect(() => {
    const currentBldgName = editedChemical.location?.buildingName || '';
    if (currentBldgName) {
      const filteredRooms = locations
        .filter(loc => loc.buildingName.trim() === currentBldgName.trim())
        .map(loc => loc.room);
      setRooms(filteredRooms);
    } else {
      setRooms([]);
    }
  }, [editedChemical.location?.buildingName, locations]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedChemical(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSave = async () => {
    try {
      const result = await updateChemicalAction({
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
        researchGroupID: editedChemical.researchGroup?.researchGroupID ?? 0, 
      });
  
      if (!result.error) {
        setSnackbarMessage('Chemical information updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => {
          router.refresh();
          router.push('/inventory-page');
        }, 1500);
      } else {
        setSnackbarMessage(result.error || 'Failed to update chemical information.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating chemical:', error);
      setSnackbarMessage('An error occurred while updating the chemical.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    setEditedChemical({ ...chemical });
    setIsEditing(false);
  };
  
  return (
    <>
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
                      <Autocomplete
                          readOnly={!isEditing || !canModifyInventory}
                          options={["Unrestricted", "Restricted"]}
                          value={editedChemical.restrictionStatus ? "Restricted" : "Unrestricted"}
                          onChange={(_, newValue) => setEditedChemical({ ...editedChemical, restrictionStatus: newValue === "Restricted" })}
                          disableClearable={!isEditing || !canModifyInventory}
                          renderInput={(params) => (
                            <TextField {...params} label="Restricted Status" InputProps={{ ...params.InputProps, readOnly: !isEditing || !canModifyInventory, endAdornment: (isEditing && canModifyInventory) ? params.InputProps.endAdornment : null }} />
                          )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Item Name" 
                      name="chemicalName" 
                      value={editedChemical.chemicalName} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing || !canModifyInventory }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth 
                      label="Cas No." 
                      name="casNumber" 
                      value={editedChemical.casNumber} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing || !canModifyInventory }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField fullWidth 
                      label="Quantity" 
                      name="quantity" 
                      value={editedChemical.quantity} 
                      onChange={handleInputChange} 
                      InputProps={{ readOnly: !isEditing || !canModifyInventory }} 
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        readOnly={!isEditing || !canModifyInventory}
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
                        onChange={(_, newValue) => setEditedChemical({ ...editedChemical, chemicalType: newValue || "Chemical" })}
                        disableClearable={!isEditing || !canModifyInventory}
                        renderInput={(params) => (
                          <TextField {...params} label="Chemical Type" InputProps={{ ...params.InputProps, readOnly: !isEditing || !canModifyInventory, endAdornment: (isEditing && canModifyInventory) ? params.InputProps.endAdornment : null }} />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        readOnly={!isEditing}
                        options={researchGroups} 
                        getOptionLabel={(option) => option.groupName}
                        value={editedChemical.researchGroup}
                        onChange={(event, newValue) => {
                          if (!newValue) return; 
                          setEditedChemical((prev) => ({
                            ...prev,
                            researchGroup: newValue,
                          }));
                        }}
                        disableClearable={!isEditing}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Owner"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              readOnly: !isEditing,
                              endAdornment: isEditing ? params.InputProps.endAdornment : null,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Supplier" name="supplier" value={editedChemical.supplier} onChange={handleInputChange} InputProps={{ readOnly: !isEditing }} />
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
                          readOnly={!isEditing}                            
                          options={buildings}
                          value={editedChemical.location?.buildingName || ""}
                          onChange={(_, newBuildingName) => {
                            const matchingLoc = locations.find(
                              (loc) => loc.buildingName.trim().toLowerCase() === (newBuildingName || "").trim().toLowerCase()
                            );
                            if (!matchingLoc) {
                              console.error("No matching location found for building name:", newBuildingName);
                              return;
                            }
                            setEditedChemical(prev => ({
                              ...prev,
                              location: {
                                ...(prev.location || {
                                  locationID: 0,
                                  building: '',
                                  room: '',
                                  buildingName: ''
                                }),
                                buildingName: newBuildingName || '',
                                building: matchingLoc.building,
                                locationID: matchingLoc.locationID,
                                room: ''
                              }
                            }));
                          }}
                          disableClearable={!isEditing}
                          renderInput={(params) => (
                            <TextField {...params} label="Building Name" InputProps={{ ...params.InputProps, readOnly: !isEditing, endAdornment: isEditing ? params.InputProps.endAdornment : null }} />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Building Code"
                          value={
                            editedChemical.location?.building
                              ? editedChemical.location.building
                              : 'N/A'
                          }
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                            readOnly={!isEditing}
                            options={rooms}
                            value={editedChemical.location?.room || ""}
                            onChange={(_, newRoom) => {
                              const currentBldgName = editedChemical.location?.buildingName || "";
                              const matchingLoc = locations.find(
                                (loc) =>
                                  loc.buildingName.trim().toLowerCase() === currentBldgName.trim().toLowerCase() &&
                                  loc.room.trim().toLowerCase() === (newRoom || "").trim().toLowerCase()
                              );
                              if (!matchingLoc) {
                                console.error("No matching location found for building:", currentBldgName, "and room:", newRoom);
                                return; 
                              }
                              setEditedChemical(prev => ({
                                ...prev,
                                location: {
                                  ...(prev.location || { locationID: 0, building: "", room: "", buildingName: "" }),
                                  room: newRoom || "",
                                  locationID: matchingLoc.locationID,
                                }
                              }));
                            }}
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
                        value={editedChemical.subLocation1} 
                        onChange={handleInputChange} 
                        InputProps={{ readOnly: !isEditing }} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth 
                        label="Sublocation 2" 
                        name="subLocation2"
                        value={editedChemical.subLocation2} 
                        onChange={handleInputChange} 
                        InputProps={{ readOnly: !isEditing }}  
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth 
                        label="Sublocation 3" 
                        name="subLocation3"
                        value={editedChemical.subLocation3} 
                        onChange={handleInputChange} 
                        InputProps={{ readOnly: !isEditing }}  
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth 
                        label="Sublocation 4" 
                        name="subLocation4"
                        value={editedChemical.subLocation4} 
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

        {/* Button Row */}
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {isEditing && canModifyInventory ? (
              <>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : canModifyInventory ? (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

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
    </>
  );
};

export default ChemicalInformation;


