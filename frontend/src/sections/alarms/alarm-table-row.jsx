import PropTypes from 'prop-types';
import { omit as _omit } from 'lodash';
import { useMemo, useState } from 'react';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Link as RouterLink } from 'react-router-dom';

import { useDeleteAlarm, useUpdateAlarm } from 'src/recoil/alarms';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ButtonPopover } from 'src/components/button';

import { useAlarmFormik } from './forms/alarm-crud';
import AlarmCrudModal from './modals/new-alarm-modal';

const countRulesFromConditionTree = (condition) => {
  if (condition.type === 'rule') {
    return 1;
  }
  return condition.tests.reduce((acc, child) => acc + countRulesFromConditionTree(child), 0);
};

export default function AlarmTableRow({ selected, alarm, handleClick }) {
  const deleteAlarm = useDeleteAlarm();
  const editAlarm = useUpdateAlarm();
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

  const [editAlarmModalOpen, setEditAlarmModalOpen] = useState(false);
  const handleEdit = () => {
    setEditAlarmModalOpen(true);
    setOpen(null);
  };
  const handleEditSensorModalClose = () => {
    setEditAlarmModalOpen(false);
    formik.resetForm();
  };

  const formik = useAlarmFormik({
    initialValues: _omit(alarm, ['history']),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (formik.dirty && formik.isValid) {
        await editAlarm(values);
        setEditAlarmModalOpen(false);
        formik.resetForm();
      }
    },
  });
  return (
    <>
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
            <MenuItem onClick={handleEdit}>
              <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
              Edit
            </MenuItem>
            <MenuItem component={RouterLink} to={`/alarms/${alarm.id}/history`}>
              <Iconify icon="eva:bar-chart-outline" sx={{ mr: 2 }} />
              History
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          </ButtonPopover>
        </TableCell>
      </TableRow>
      <AlarmCrudModal
        title="Edit Alarm"
        buttonText="Save"
        open={editAlarmModalOpen}
        onClose={handleEditSensorModalClose}
        formik={formik}
      />
    </>
  );
}

AlarmTableRow.propTypes = {
  alarm: PropTypes.object,
  handleClick: PropTypes.func,
  selected: PropTypes.any,
};
