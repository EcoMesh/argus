import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useDeleteSensor } from 'src/recoil/sensors';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import SensorQrModal from './modals/sensor-qr-modal';
import SensorEditNicknameModal from './modals/edit-nickname-modal';

// ----------------------------------------------------------------------

export function SensorStatusLabel({ sensor, ...props }) {
  return sensor.location ? (
    <Label {...props} color="success">
      Online
    </Label>
  ) : (
    <Label {...props} color="error">
      Offline
    </Label>
  );
}

SensorStatusLabel.propTypes = {
  sensor: PropTypes.object,
};

export default function SensorTableRow({ sensor, selected, handleClick }) {
  const [open, setOpen] = useState(null);
  const deleteSensor = useDeleteSensor();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditNicknameModal, setShowEditNicknameModal] = useState(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Typography variant="subtitle2" noWrap>
            {sensor.nodeId}
          </Typography>
        </TableCell>
        <TableCell>{sensor.nickname || 'N/A'}</TableCell>
        <TableCell>{sensor.location?.coordinates?.[0] || 'N/A'}</TableCell>

        <TableCell>{sensor.location?.coordinates?.[1] || 'N/A'}</TableCell>

        <TableCell align="center">{sensor.uplink ? 'Yes' : 'No'}</TableCell>

        <TableCell>
          <SensorStatusLabel sensor={sensor} />
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            setShowEditNicknameModal(true);
            handleCloseMenu();
          }}
        >
          <Iconify icon="eva:edit-outline" sx={{ mr: 2 }} />
          Nickname
        </MenuItem>

        <MenuItem
          onClick={() => {
            setShowQrModal(true);
            handleCloseMenu();
          }}
        >
          <Iconify icon="bx:qr" sx={{ mr: 2 }} />
          See QR
        </MenuItem>

        <MenuItem
          onClick={() => {
            deleteSensor(sensor.id);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <SensorQrModal open={showQrModal} handleClose={() => setShowQrModal(false)} sensor={sensor} />
      <SensorEditNicknameModal
        open={showEditNicknameModal}
        handleClose={() => setShowEditNicknameModal(false)}
        sensor={sensor}
      />
    </>
  );
}

SensorTableRow.propTypes = {
  handleClick: PropTypes.func,
  id: PropTypes.string,
  sensor: PropTypes.object,
  selected: PropTypes.any,
};
