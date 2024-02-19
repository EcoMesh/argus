import * as React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';

import { Box } from '@mui/material';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Close as CloseIcon } from '@mui/icons-material';

import { selectedRegionAtom } from 'src/recoil/regions';

import { useAlarmFormik, AlertCrudForm } from '../forms/alarm-crud';

/* trunk-ignore(eslint/prefer-arrow-callback) */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewAlarmModal({ open, handleClose }) {
  const internalHandleClose = (e) => {
    formik.resetForm();
    handleClose();
  };

  const handleSubmit = () => {
    if (formik.isValid) {
      console.log(formik.dirty && formik.values);
      internalHandleClose();
    }
  };

  const formik = useAlarmFormik({
    onSubmit: handleSubmit,
  });

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar color="info" position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={internalHandleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            New Alarm
          </Typography>
          <Button autoFocus color="inherit" onClick={handleSubmit}>
            Create
          </Button>
        </Toolbar>
      </AppBar>
      <AlertCrudForm formik={formik} />
    </Dialog>
  );
}

NewAlarmModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
