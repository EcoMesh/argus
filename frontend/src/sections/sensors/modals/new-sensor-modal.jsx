import * as React from 'react';
import PropTypes from 'prop-types';
import { Client } from '@meshtastic/js';

import Modal from '@mui/material/Modal';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Stack, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

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

export default function NewSensorModal({ open, handleClose }) {
  const [isUplinkNode, setIsUplinkNode] = React.useState(false);
  // const [nodeId, setNodeId] = React.useState(null);
  const connection = meshtasticClient.createSerialConnection(406814025);

  const connect = async () => {
    // const port = await navigator.serial.requestPort({});
    console.log(connection.port);
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
    // m
    // console.log('test', m);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Stack spacing={3} sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New Sensor
          </Typography>
          {isSerialSupported ? (
            <>
              <FormGroup>
                <Stack spacing={2}>
                  <FormControl>
                    <InputLabel>Region</InputLabel>
                    <Select value={10}>
                      <MenuItem value={10}>Courand Family Ranch</MenuItem>
                    </Select>
                  </FormControl>
                  <FormGroup>
                    <Typography id="modal-modal-description">
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked
                            checked={isUplinkNode}
                            onChange={() => setIsUplinkNode((v) => !v)}
                          />
                        }
                        label="Uplink Node"
                      />
                    </Typography>
                  </FormGroup>
                </Stack>
              </FormGroup>
              {isUplinkNode && (
                <FormGroup>
                  <Stack spacing={2}>
                    <TextField id="standard-multiline-flexible" label="Network SSID" />
                    <TextField id="standard-multiline-flexible" label="Network Password" />
                    <TextField id="standard-multiline-flexible" label="MQTT Host" />
                  </Stack>
                </FormGroup>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Button variant="contained" onClick={connect} disabled={!isSerialSupported}>
                  Register
                </Button>
                <Button variant="contained" onClick={handleClose} color="error">
                  Cancel
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography id="modal-modal-description">
                Your browser does not support serial connections. Please try using Chrome.
              </Typography>
              <Button variant="contained" onClick={handleClose}>
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
