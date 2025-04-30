import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'components/ui-component/cards/MainCard';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface ColumnCustomisationModalProps {
  open: boolean;
  onClose: () => void;
  visibleColumns: Record<string, boolean>;
  onColumnVisibilityChange: (column: string, visible: boolean) => void;
}

const ColumnCustomisationModal: React.FC<ColumnCustomisationModalProps> = ({ open, onClose, visibleColumns, onColumnVisibilityChange }) => {
  const columns = [
    { id: 'supplier', label: 'Supplier' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'location', label: 'Location' },
    { id: 'type', label: 'Type' },
    { id: 'owner', label: 'Owner' },
    { id: 'added', label: 'Added' },
    { id: 'updated', label: 'Updated' }
  ];

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
          title="Customise Columns"
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ p: 2 }}>
            <FormGroup>
              {columns.map((column) => (
                <FormControlLabel
                  key={column.id}
                  control={
                    <Checkbox checked={visibleColumns[column.id]} onChange={(e) => onColumnVisibilityChange(column.id, e.target.checked)} />
                  }
                  label={column.label}
                />
              ))}
            </FormGroup>
          </Box>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default ColumnCustomisationModal;
