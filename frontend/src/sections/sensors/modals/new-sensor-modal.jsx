import * as Yup from 'yup';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { Client } from '@meshtastic/js';
import { useRecoilValue } from 'recoil';

import Modal from '@mui/material/Modal';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Stack, Button, FormControl } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { selectedRegionAtom } from 'src/recoil/regions';

const meshtasticClient = new Client();

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
};

const isSerialSupported = 'serial' in navigator;

const validationSchema = Yup.object()
  .shape({
    isUplink: Yup.boolean().required('Uplink Node is required'),
  })
  .when(([values], schema) => {
    if (values.isUplink) {
      return schema.shape({
        networkSsid: Yup.string().required('Network SSID is required'),
        networkPsk: Yup.string().required('Network PSK is required'),
        mqttHost: Yup.string().required('MQTT Host is required'),
      });
    }
    return schema;
  });

export default function NewSensorModal({ open, handleClose }) {
  const connection = meshtasticClient.createSerialConnection(406814025);
  // const [nodeId, setNodeId] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      isUplink: false,
      networkSsid: '',
      networkPsk: '',
      mqttHost: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('submit', values);

      // const port = await navigator.serial.requestPort({});
      if (connection.port === undefined) {
        await connection.connect({});
      }
      // connection.events.onDeviceMetadataPacket.subscribe((p) => {
      //   console.log('metadata', p);
      // }
      // );
      // connection.events.onConfigPacket.subscribe((p) => {
      //   console.log('config', p);
      // }
      // );

      Object.keys(connection.events).forEach((key) => {
        connection.events[key].subscribe((p) => {
          console.log('event', key, JSON.stringify(p));
        });
      });

      // connection.events.onUserPacket.subscribe((p) => {
      //   console.log('user', p);
      //   setNodeId(p.data.id);
      // });

      // connection.connect({
      //   port,
      //   concurrentLogOutput: true,
      // });
      // const m = await connection.getOwner()

      // console.log('test', m);

      // innerHandleClose(null);
    },
  });

  const region = useRecoilValue(selectedRegionAtom);
  const innerHandleClose = (e) => {
    formik.resetForm();
    handleClose(e);
  };

  if (!region) {
    return null;
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={innerHandleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Stack spacing={3} sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            New Sensor
          </Typography>
          {isSerialSupported ? (
            <>
              <FormGroup>
                <Stack spacing={2}>
                  <FormControl>
                    <Typography id="modal-modal-title" variant="h6" component="h3">
                      Region
                    </Typography>
                    <Typography id="modal-modal-title" variant="p">
                      {region.name}
                    </Typography>
                  </FormControl>
                  <FormGroup>
                    <Typography id="modal-modal-description">
                      <FormControlLabel
                        control={
                          <Switch
                            {...formik.getFieldProps('isUplink')}
                            checked={formik.values.isUplink}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Uplink Node"
                      />
                    </Typography>
                  </FormGroup>
                </Stack>
              </FormGroup>
              {formik.values.isUplink && (
                <FormGroup>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Network SSID"
                      {...formik.getFieldProps('networkSsid')}
                      error={formik.touched.networkSsid && Boolean(formik.errors.networkSsid)}
                      helperText={formik.touched.networkSsid && formik.errors.networkSsid}
                    />
                    <TextField
                      fullWidth
                      label="Network PSK"
                      {...formik.getFieldProps('networkPsk')}
                      error={formik.touched.networkPsk && Boolean(formik.errors.networkPsk)}
                      helperText={formik.touched.networkPsk && formik.errors.networkPsk}
                    />
                    <TextField
                      fullWidth
                      label="MQTT Host"
                      {...formik.getFieldProps('mqttHost')}
                      error={formik.touched.mqttHost && Boolean(formik.errors.mqttHost)}
                      helperText={formik.touched.mqttHost && formik.errors.mqttHost}
                    />
                  </Stack>
                </FormGroup>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="contained"
                  onClick={formik.handleSubmit}
                  disabled={!isSerialSupported || !formik.isValid}
                >
                  Register
                </Button>
                <Button variant="contained" onClick={innerHandleClose} color="error">
                  Cancel
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography id="modal-modal-description">
                Your browser does not support serial connections. Please try using Chrome.
              </Typography>
              <Button variant="contained" onClick={innerHandleClose}>
                Close
              </Button>
            </>
          )}
        </Stack>
      </Modal>
    </div>
  );
}

NewSensorModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
