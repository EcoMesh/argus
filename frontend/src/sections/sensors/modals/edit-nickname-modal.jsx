import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { usePutSensor } from 'src/recoil/sensors';

export default function SensorEditNicknameModal({ open, handleClose, sensor }) {
  const [nickname, setNickname] = useState(sensor.nickname || '');

  const putSensor = usePutSensor();

  const handleSave = async () => {
    await putSensor(sensor.id, { nickname: nickname || null });

    handleClose(nickname);
  };

  if (!sensor) return null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Initialize Sensor ({sensor.nodeId})</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Scan the QR code with your phone to initialize the sensor.
        </DialogContentText>
        <TextField
          sx={{ mt: 2 }}
          label="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SensorEditNicknameModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  sensor: PropTypes.object,
};
