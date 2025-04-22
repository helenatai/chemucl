import React, { useEffect, useRef, useState } from 'react';
import { Box, Modal, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'ui-component/cards/MainCard';
import QRCode from 'qrcode';
import { getChemicalByQrCode } from 'actions/qr-code/qrCodeActionHandler';
import { findLocationByQrID } from 'db/queries/Location';

interface Chemical {
  chemicalName: string;
}

interface Location {
  building: string;
  room: string;
}

interface QrCodeModalProps {
  open: boolean;
  qrID: string;
  onClose: () => void;
  type?: 'chemical' | 'location';
}

const QR_CODE_CONFIG = {
  errorCorrectionLevel: 'H' as const,
  margin: 1,
  width: 200,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
};

const QrCodeModal: React.FC<QrCodeModalProps> = ({ open, qrID, onClose, type = 'chemical' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<Chemical | Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setData(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        let result;
        if (type === 'chemical') {
          result = await getChemicalByQrCode(qrID);
        } else {
          result = await findLocationByQrID(qrID);
        }
        
        if (!isMounted) return;

        if (!result) {
          setError(`${type === 'chemical' ? 'Chemical' : 'Location'} not found`);
          setData(null);
          return;
        }

        if ('error' in result) {
          setError(result.error);
          setData(null);
        } else {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(`Unexpected error fetching ${type} data.`);
        setData(null);
      }
    };

    const generateQRCode = async () => {
      if (!canvasRef.current) return;
      
      try {
        await QRCode.toCanvas(canvasRef.current, qrID, QR_CODE_CONFIG);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to generate QR code.');
      }
    };

    if (open && qrID) {
      fetchData();
      // Small delay to ensure canvas is ready
      const timeout = setTimeout(generateQRCode, 100);
      return () => {
        isMounted = false;
        clearTimeout(timeout);
      };
    }
  }, [open, qrID, type]);

  const handleSaveAsPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${qrID}.png`;
    link.click();
  };

  const getTitle = () => {
    if (error) return "Error";
    if (!data) return "Loading...";
    
    if (type === 'chemical' && 'chemicalName' in data) {
      return data.chemicalName;
    } else if (type === 'location' && 'building' in data) {
      return `${data.building} ${data.room}`;
    }
    
    return "Loading...";
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      aria-labelledby="qr-code-title" 
      aria-describedby="qr-code-description"
    >
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
          title={getTitle()}
          secondary={
            <IconButton onClick={onClose} size="small" aria-label="close">
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            {error ? (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  <canvas
                    ref={canvasRef}
                    style={{ width: '200px', height: '200px' }}
                    aria-label="QR Code"
                  />
                </Box>
                <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                  {qrID}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleSaveAsPng} 
                  sx={{ mt: 1, mb: 2 }}
                >
                  Save as PNG
                </Button>
              </>
            )}
          </Box>
        </MainCard>
      </Box>
    </Modal>
  );
};

export default QrCodeModal;
