import * as React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';

import { DialogAppBar, DialogFullscreen } from 'src/components/dialog';

import { AlertCrudForm, useAlarmFormik } from '../forms/alarm-crud';

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
    <DialogFullscreen open={open} onClose={handleClose}>
      <DialogAppBar
        title="New Alarm"
        onClose={internalHandleClose}
        actionButton={
          <Button
            autoFocus
            color="inherit"
            onClick={handleSubmit}
            disabled={!formik.dirty || !formik.isValid}
          >
            Create
          </Button>
        }
      />
      <AlertCrudForm formik={formik} />
    </DialogFullscreen>
  );
}

NewAlarmModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
