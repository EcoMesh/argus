import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Label from 'src/components/label';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { ButtonPopover } from 'src/components/button';
import { useDeleteAlarm } from 'src/recoil/alarms';

const countRulesFromConditionTree = (condition) => {
  if (condition.type === 'rule') {
    return 1;
  }
  return condition.tests.reduce((acc, child) => acc + countRulesFromConditionTree(child), 0);
};

export default function AlarmTableRow({ selected, alarm, handleClick }) {
  const deleteAlarm = useDeleteAlarm();
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleDelete = async () => {
    await deleteAlarm(alarm.id);
    setOpen(null);
  };

  const isInAlarm = useMemo(() => alarm.history.find((h) => !h.end), [alarm.history]);

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={handleClick} />
      </TableCell>

      <TableCell component="th" scope="row" padding="none">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {alarm.name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{countRulesFromConditionTree(alarm.condition)}</TableCell>

      <TableCell>{alarm.subscribers.length}</TableCell>

      <TableCell>
        {isInAlarm ? <Label color="success">Active</Label> : <Label color="info">Inactive</Label>}
      </TableCell>

      <TableCell align="right">
        <ButtonPopover open={open} onClick={handleOpenMenu} onClose={handleCloseMenu}>
          <MenuItem onClick={handleCloseMenu}>
            <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Delete
          </MenuItem>
        </ButtonPopover>
      </TableCell>
    </TableRow>
  );
}

AlarmTableRow.propTypes = {
  alarm: PropTypes.object,
  handleClick: PropTypes.func,
  selected: PropTypes.any,
};
