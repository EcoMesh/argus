import { useRef } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-qr-code';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

export default function SensorQrModal({ open, handleClose, sensor }) {
  const qrCodeRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`
    <html>
      <head><title>${sensor.nodeId} QR Code | EcoMesh</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          text-align: center;
          padding: 32px;
        }
      </style>
    </head>
    <body>
      <h1>${sensor.nodeId} QR Code</h1>
      <p>Scan this QR code with your phone to initialize the sensor.</p>
      <div style="margin: 0 auto; width: fit-content; margin-top: 32px;">
        ${qrCodeRef.current.outerHTML}
      </div>
    </body>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleOpenLink = () => {
    window.open(sensor.initializationUrl, '_blank');
  };

  if (!sensor) return null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Initialize Sensor ({sensor.nodeId})</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Scan the QR code with your phone to initialize the sensor.
        </DialogContentText>
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              border: (theme) => alpha(theme.palette.grey[500], 0.2),
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
            }}
          >
            <QRCode
              ref={qrCodeRef}
              size={128}
              value={sensor.initializationUrl}
              viewBox="0 0 128 128"
            />
          </Box>
        </Stack>
        <Stack direction="row" justifyContent="center" sx={{ mt: 1.5 }}>
          <Button color="primary" onClick={handleOpenLink}>
            Open Link
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SensorQrModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  sensor: PropTypes.object,
};
