'use client';

import React, { useState, useRef } from 'react';
import { Button, Typography, Box, Alert, LinearProgress, Stack, Modal } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { ROLES } from 'constants/roles';
import MainCard from 'components/ui-component/cards/MainCard';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface ImportUsersDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

interface UserImportData {
  name: string;
  email: string;
  permission: (typeof ROLES)[keyof typeof ROLES];
  researchGroup: string;
  activeStatus?: boolean;
}

const ImportUsersDialog: React.FC<ImportUsersDialogProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredColumns = ['Name', 'Email', 'Permission', 'Research Group', 'Active Status'];

  const handleDownloadTemplate = () => {
    const csvContent = requiredColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const transformHeaderToKey = (header: string): string => {
    switch (header) {
      case 'Name':
        return 'name';
      case 'Email':
        return 'email';
      case 'Permission':
        return 'permission';
      case 'Research Group':
        return 'researchGroup';
      case 'Active Status':
        return 'activeStatus';
      default:
        return header.toLowerCase();
    }
  };

  const validateData = (data: any[]): UserImportData[] => {
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
        transformedRow[transformedKey] = value === '' ? null : value;
      });

      // Check required fields
      if (!transformedRow.name || !transformedRow.email || !transformedRow.permission || !transformedRow.researchGroup) {
        throw new Error(`Row ${index + 1} is missing required fields`);
      }

      // Validate permission
      if (![ROLES.ADMIN, ROLES.STAFF, ROLES.RESEARCH_STUDENT].includes(transformedRow.permission)) {
        throw new Error(`Row ${index + 1}: Permission must be either '${ROLES.ADMIN}', '${ROLES.STAFF}' or '${ROLES.RESEARCH_STUDENT}'`);
      }
      transformedRow.permission = transformedRow.permission;

      // Convert active status to boolean
      transformedRow.activeStatus = transformedRow.activeStatus?.toString().toLowerCase() === 'true';

      return transformedRow as UserImportData;
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
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
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
          title="Import Users"
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="body1">To import users, please use our CSV template format below:</Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <input type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} ref={fileInputRef} />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ mr: 2 }}>
                  Download Template
                </Button>
                <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </Box>

              {file && <Alert severity="info">Selected file: {file.name}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
              {isLoading && <LinearProgress />}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={onClose} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleImport} variant="contained" disabled={!file || isLoading}>
                Import
              </Button>
            </Box>
          </Box>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default ImportUsersDialog;
