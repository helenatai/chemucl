'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, Button, Typography, CircularProgress } from '@mui/material';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { scanLocationAction, scanChemicalAction, completeAuditAction, pauseAuditAction } from 'actions/audit/server-actions/auditActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface AuditQrScannerModalProps {
  open: boolean;
  auditId: number;
  onClose: () => void;
  onLocationVerified: (qrData: string) => void;
  onChemicalScanned: (qrData: string) => void;
  onComplete: () => Promise<void>;
  onPause: () => void;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

const fixedErrorHeight = 40;

const AuditQrScannerModal: React.FC<AuditQrScannerModalProps> = ({
  open,
  auditId,
  onClose,
  onLocationVerified,
  onChemicalScanned,
  onComplete,
  onPause,
}) => {

  const [mode, setMode] = useState<'location' | 'item'>('location');
  const modeRef = useRef<'location' | 'item'>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const [locationVerified, setLocationVerified] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');  
  const [loading, setLoading] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [scanning] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    open: boolean;
  }>({
    message: '',
    type: 'info',
    open: false
  });
  const scanCooldownRef = useRef<boolean>(false);
  const scanHistoryRef = useRef<Set<string>>(new Set());

  // // To prevent immediate repeated scans of the same code
  // const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  // const [lastScanTime, setLastScanTime] = useState<number>(0);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "qr-reader-container";

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Clean up the scanner when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => 
          console.error("Failed to clear scanner.", error)
        );
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (open && !scannerInitialized) {
      setLoading(true);
      
      const initScanner = setTimeout(async () => {
        const container = document.getElementById(scannerContainerId);
        
        if (container) {
          const qrReaderElement = document.createElement('div');
          qrReaderElement.id = 'qr-reader';
          qrReaderElement.style.width = '100%';
          container.innerHTML = '';
          container.appendChild(qrReaderElement);
          
          const config = { 
            fps: 10, 
            qrbox: 250, 
            rememberLastUsedCamera: true,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          };
          const verbose = false;

          try {
            // Wait for DOM to be fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            scannerRef.current = new Html5QrcodeScanner("qr-reader", config, verbose);
            
            // Add error handling for header message
            const headerElement = document.getElementById('qr-reader-header');
            if (headerElement) {
              headerElement.style.display = 'none';
            }
            
            scannerRef.current.render(
              async (decodedText: string) => {
                if (!scanning || scanCooldownRef.current || processing) {
                  return;
                }
            
                scanCooldownRef.current = true;
                setTimeout(() => {
                  scanCooldownRef.current = false;
                }, 5000); 
            
                if (modeRef.current === 'item' && scanHistoryRef.current.has(decodedText)) {
                  setScanFeedback({
                    message: 'Item already scanned',
                    type: 'info',
                    open: true
                  });
                  return;
                }
            
                setProcessing(true);
                setErrorMessage('');
            
                if (modeRef.current === 'location') {
                  const result = await scanLocationAction(auditId, decodedText);
                  if (!result.valid) {
                    setScanFeedback({
                      message: `Invalid location: Expected ${result.expected}`,
                      type: 'error',
                      open: true
                    });
                    setTimeout(() => setProcessing(false), 5000);
                    return;
                  }
                  setScannedData(decodedText);
                  onLocationVerified(decodedText);
                  setLocationVerified(true);
                  setMode('item');                   // Switch to scanning chemicals
                  setScanFeedback({
                    message: 'Location verified successfully!',
                    type: 'success',
                    open: true
                  });
                } else {
                  const result = await scanChemicalAction(auditId, decodedText);
                  if (!result.success) {
                    setScanFeedback({
                      message: result.message || 'Failed to update audit record',
                      type: 'error',
                      open: true
                    });
                    setTimeout(() => setProcessing(false), 5000);
                    return;
                  }
                  setScannedData(decodedText);
                  onChemicalScanned(decodedText);
                  scanHistoryRef.current.add(decodedText); // Add to scan history
                  setScanFeedback({
                    message: 'Item scanned successfully!',
                    type: 'success',
                    open: true
                  });
                }
                // wait some time
                setTimeout(() => {
                  setProcessing(false);
                }, 5000);
              },
              (errorMessage: string) => {
                console.error("QR Code Scan Error:", errorMessage);
              }
            );
            
            setScannerInitialized(true);
          } catch (error) {
            console.error("Failed to initialize scanner:", error);
            setErrorMessage("Failed to initialize scanner. Please try again.");
          }
          
          setLoading(false);
        }
      }, 500); // Increased delay to ensure DOM is ready

      return () => clearTimeout(initScanner);
    }
  }, [open, scannerInitialized, processing, onLocationVerified, onChemicalScanned, auditId]);

  const handleComplete = async () => {
    try {
      setLoading(true);
      const result = await completeAuditAction(auditId);
      if (!result.success) {
        setErrorMessage(result.message || 'Error completing audit.');
      }
      await onComplete();
      onClose();
    } catch (err) {
      console.error('Error completing audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      const result = await pauseAuditAction(auditId);
      if (!result.success) {
        setErrorMessage(result.message || 'Error pausing audit.');
      } else {
        await onPause();
        onClose();
      }

    } catch (err) {
      console.error('Error pausing audit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="qr-scanner-modal"
      aria-describedby="qr-scanner-modal-description"
    >
      <>
      <Box sx={modalStyle}>
        <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
          {mode === 'location' ? '1. Scan Location QR' : '2. Scan Item QR'}
        </Typography>

        <Box sx={{ minHeight: fixedErrorHeight }}>
          {errorMessage && (
            <Typography variant="body2" sx={{ color: 'red', whiteSpace: 'pre-line' }}>
              {errorMessage}
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* scanner container */}
        <div id={scannerContainerId} style={{ width: '100%', minHeight: 240 }}></div>

        {mode === 'location' && locationVerified && scannedData && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1, mb: 2 }}>
            Location verified: {scannedData}
          </Typography>
        )}

        {mode === 'item' && scannedData && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1, mb: 2 }}>
            Last scanned item: {scannedData}
          </Typography>
        )}

        {mode === 'item' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handlePause} 
              disabled={loading}
            >
              Pause Audit
            </Button>
            <Button 
              variant="contained" 
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Audit'}
            </Button>
          </Box>
        )}
      </Box>
      <Snackbar
        open={scanFeedback.open}
        autoHideDuration={3000}
        onClose={() => setScanFeedback(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={scanFeedback.type} 
          sx={{ width: '100%' }}
          onClose={() => setScanFeedback(prev => ({ ...prev, open: false }))}
        >
          {scanFeedback.message}
        </Alert>
      </Snackbar>
      </>
    </Modal>
  );
};

export default AuditQrScannerModal;