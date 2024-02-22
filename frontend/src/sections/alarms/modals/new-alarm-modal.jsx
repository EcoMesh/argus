import * as React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';

import { DialogAppBar, DialogFullscreen } from 'src/components/dialog';

import { AlertCrudForm } from '../forms/alarm-crud';

export default function AlarmCrudModal({ title, buttonText, open, onClose, formik }) {
  return (
    <DialogFullscreen open={open} onClose={onClose}>
      <DialogAppBar
        title={title}
        onClose={onClose}
        actionButton={
          <Button
            autoFocus
            color="inherit"
            onClick={() => formik.submitForm()}
            disabled={!formik.dirty || !formik.isValid}
          >
            {buttonText}
          </Button>
        }
      />
      <AlertCrudForm formik={formik} />
    </DialogFullscreen>
  );
}

AlarmCrudModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
};
