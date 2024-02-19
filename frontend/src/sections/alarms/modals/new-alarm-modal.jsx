import * as React from 'react';
import PropTypes from 'prop-types';

import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Close as CloseIcon } from '@mui/icons-material';

import { useAlarmFormik, AlertCrudForm } from '../forms/alarm-crud';

/* trunk-ignore(eslint/prefer-arrow-callback) */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewAlarmModal({ open, handleClose }) {
  const internalHandleClose = (values = null) => {
    formik.resetForm();
    handleClose(values);
  };

  const handleSubmit = () => {
    if (formik.dirty && formik.isValid) {
      internalHandleClose(formik.values);
    }
  };

  const formik = useAlarmFormik({
    onSubmit: handleSubmit,
  });

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar color="default" position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={internalHandleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            New Alarm
          </Typography>
          <Button
            autoFocus
            color="inherit"
            onClick={handleSubmit}
            disabled={!formik.dirty || !formik.isValid}
          >
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
