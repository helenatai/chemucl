'use client';

import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'ui-component/cards/MainCard';

interface AddFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const AddFormModal: React.FC<AddFormModalProps> = ({ open, onClose, title, children }) => {
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
          overflow: 'hidden',
        }}
      >
        <MainCard
          title={title}
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          {children}
        </MainCard>
      </Box>
    </Modal>
  );
};

export default AddFormModal;
