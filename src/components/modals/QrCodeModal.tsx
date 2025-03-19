import React, { useEffect, useRef, useState } from 'react';
import { Box, Modal, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'ui-component/cards/MainCard';
import QRCode from 'qrcode';
import { getChemicalByQrCode } from 'actions/qr-code/qrCodeActionHandler';

interface QrCodeModalProps {
  open: boolean;
  qrID: string;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ open, qrID, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chemical, setChemical] = useState<{ chemicalName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && qrID) {
      const fetchChemical = async () => {
        try {
          const result = await getChemicalByQrCode(qrID);
          
          if ('error' in result) { 
            console.error('Error fetching chemical:', result.error);
            setError(result.error);
          } else {
            setChemical(result);
            setError(null);
          }
        } catch (err) {
          console.error('Unexpected error fetching chemical:', err);
          setError('Unexpected error fetching chemical.');
        }
      };

      fetchChemical();

      const timeout = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          QRCode.toCanvas(canvas, qrID, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 200,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          }).catch((err) => {
            console.error('Failed to render QR Code:', err);
          });
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [open, qrID]);

  const handleSaveAsPng = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${qrID}.png`;
      a.click();
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="qr-code-title" aria-describedby="qr-code-description">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <MainCard
          title={error ? "Error" : chemical ? chemical.chemicalName : 'Loading...'}
          secondary={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef} style={{width: '200px', height: '200px'}}
              ></canvas>
            </Box>
            <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
              {qrID}
            </Typography>
            <Button variant="contained" onClick={handleSaveAsPng} sx={{ mt: 1, mb: 2}}>
              Save as PNG
            </Button>
          </Box>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default QrCodeModal;
