'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';

interface ImportInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
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

const ImportInventoryDialog: React.FC<ImportInventoryDialogProps> = ({
  open,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      case 'QR ID': return 'qrID';
      case 'Chemical Name': return 'chemicalName';
      case 'CAS Number': return 'casNumber';
      case 'Chemical Type': return 'chemicalType';
      case 'Restriction Status': return 'restrictionStatus';
      case 'Research Group': return 'researchGroup';
      case 'Building Code': return 'building';
      case 'Quartzy Number': return 'quartzyNumber';
      case 'Sub Location 1': return 'subLocation1';
      case 'Sub Location 2': return 'subLocation2';
      case 'Sub Location 3': return 'subLocation3';
      case 'Sub Location 4': return 'subLocation4';
      default: return header.toLowerCase();
    }
  };

  const validateData = (data: any[]): ChemicalImportData[] => {
    if (data.length === 0) {
      throw new Error('The file is empty');
    }

    // Check headers
    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
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
      if (!transformedRow.qrID || !transformedRow.chemicalName || !transformedRow.casNumber || 
          !transformedRow.chemicalType || !transformedRow.researchGroup || 
          !transformedRow.building || !transformedRow.room) {
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

    setIsLoading(true);
    setError('');

    Papa.parse(file, {
      complete: async (results: ParseResult<any>) => {
        try {
          if (results.errors.length > 0) {
            throw new Error('Error parsing CSV file');
          }

          const data = validateData(results.data);
          await onImport(data);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Inventory</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            To import inventory records, please use our CSV template format below:
          </Typography>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 2 }}
            >
              Choose File
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </Box>

          {file && (
            <Alert severity="info">
              Selected file: {file.name}
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {isLoading && <LinearProgress />}

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleImport} 
          variant="contained" 
          disabled={!file || isLoading}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportInventoryDialog; 