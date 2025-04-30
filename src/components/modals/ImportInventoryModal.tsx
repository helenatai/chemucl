'use client';

import React, { useState, useRef } from 'react';
import { DialogContent, DialogActions, Button, Typography, Box, Alert, LinearProgress, Stack, Modal, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import MainCard from 'components/ui-component/cards/MainCard';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface ImportInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  initialLocations: { locationID: number; building: string; room: string }[];
  initialResearchGroups: { researchGroupID: number; groupName: string }[];
}

interface ChemicalImportData {
  qrID: string;
  chemicalName: string;
  casNumber?: string;
  quantity: number;
  chemicalType: string;
  supplier?: string;
  description?: string;
  researchGroup: string;
  building: string;
  room: string;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
  restrictionStatus: boolean;
  quartzyNumber: string;
}

interface Location {
  locationID: number;
  building: string;
  room: string;
}

interface Owner {
  researchGroupID: number;
  groupName: string;
}

const ImportInventoryDialog: React.FC<ImportInventoryDialogProps> = ({
  open,
  onClose,
  onImport,
  initialLocations,
  initialResearchGroups
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [owners] = useState<Owner[]>(initialResearchGroups);
  const [locations] = useState<Location[]>(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  const requiredColumns = [
    'QR ID',
    'Chemical Name',
    'CAS Number',
    'Quantity',
    'Chemical Type',
    'Restriction Status',
    'Research Group',
    'Building Code',
    'Room',
    'Supplier',
    'Description',
    'Quartzy Number',
    'Sub Location 1',
    'Sub Location 2',
    'Sub Location 3',
    'Sub Location 4'
  ];

  const handleDownloadTemplate = () => {
    // Create CSV content with headers
    const csvContent = requiredColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const transformHeaderToKey = (header: string): string => {
    switch (header) {
      case 'QR ID':
        return 'qrID';
      case 'Chemical Name':
        return 'chemicalName';
      case 'CAS Number':
        return 'casNumber';
      case 'Chemical Type':
        return 'chemicalType';
      case 'Restriction Status':
        return 'restrictionStatus';
      case 'Research Group':
        return 'researchGroup';
      case 'Building Code':
        return 'building';
      case 'Quartzy Number':
        return 'quartzyNumber';
      case 'Sub Location 1':
        return 'subLocation1';
      case 'Sub Location 2':
        return 'subLocation2';
      case 'Sub Location 3':
        return 'subLocation3';
      case 'Sub Location 4':
        return 'subLocation4';
      default:
        return header.toLowerCase();
    }
  };

  const validateData = (data: any[]): ChemicalImportData[] => {
    if (data.length === 0) {
      throw new Error('The file is empty');
    }

    // Check headers
    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Transform and validate each row
    return data.map((row, index) => {
      const transformedRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        const transformedKey = transformHeaderToKey(key);
        // Handle empty strings
        transformedRow[transformedKey] = value === '' ? null : value;
      });

      // Check required fields
      if (
        !transformedRow.qrID ||
        !transformedRow.chemicalName ||
        !transformedRow.casNumber ||
        !transformedRow.chemicalType ||
        !transformedRow.researchGroup ||
        !transformedRow.building ||
        !transformedRow.room
      ) {
        throw new Error(`Row ${index + 1} is missing required fields`);
      }

      // Convert quantity to number
      const quantity = Number(transformedRow.quantity);
      if (isNaN(quantity)) {
        throw new Error(`Row ${index + 1}: Quantity must be a number`);
      }
      transformedRow.quantity = quantity;

      // Convert restriction status to boolean
      transformedRow.restrictionStatus = transformedRow.restrictionStatus?.toString().toLowerCase() === 'true';

      // Ensure optional fields are properly handled
      transformedRow.supplier = transformedRow.supplier || null;
      transformedRow.description = transformedRow.description || null;
      transformedRow.quartzyNumber = transformedRow.quartzyNumber || null;
      transformedRow.subLocation1 = transformedRow.subLocation1 || null;
      transformedRow.subLocation2 = transformedRow.subLocation2 || null;
      transformedRow.subLocation3 = transformedRow.subLocation3 || null;
      transformedRow.subLocation4 = transformedRow.subLocation4 || null;

      return transformedRow as ChemicalImportData;
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!selectedOwner) {
      setError('Please select a research group');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    setIsLoading(true);
    setError('');

    Papa.parse(file, {
      complete: async (results: ParseResult<any>) => {
        try {
          if (results.errors.length > 0) {
            throw new Error('Error parsing CSV file');
          }

          const data = validateData(results.data);

          // Update the data with selected location and owner
          const updatedData = data.map((item) => ({
            ...item,
            researchGroup: selectedOwner.groupName,
            building: selectedLocation.building,
            room: selectedLocation.room
          }));

          await onImport(updatedData);
          onClose();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred while importing');
        } finally {
          setIsLoading(false);
        }
      },
      header: true,
      skipEmptyLines: true
    });
  };

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
          title="Import Inventory"
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          <DialogContent>
            <Stack spacing={3}>
              <Autocomplete
                options={owners}
                getOptionLabel={(option) => option.groupName}
                value={selectedOwner}
                onChange={(_, newValue) => setSelectedOwner(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Research Group"
                    required
                    error={!selectedOwner && error !== ''}
                    helperText={!selectedOwner && error !== '' ? 'Research group is required' : ''}
                  />
                )}
              />

              <Autocomplete
                options={locations}
                getOptionLabel={(option) => `${option.building} ${option.room}`}
                value={selectedLocation}
                onChange={(_, newValue) => setSelectedLocation(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    required
                    error={!selectedLocation && error !== ''}
                    helperText={!selectedLocation && error !== '' ? 'Location is required' : ''}
                  />
                )}
              />

              <Box sx={{ textAlign: 'center', py: 2 }}>
                <input type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} ref={fileInputRef} />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ mr: 2 }}>
                  Download Template
                </Button>
                <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </Box>

              {file && (
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Selected file: {file.name}
                </Typography>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {isLoading && <LinearProgress sx={{ mt: 2 }} />}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} variant="contained" disabled={!file || isLoading}>
              Import
            </Button>
          </DialogActions>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default ImportInventoryDialog;
