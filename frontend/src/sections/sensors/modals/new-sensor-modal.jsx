import * as Yup from 'yup';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Client, Protobuf } from '@meshtastic/js';

import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Stack,
  Button,
  Dialog,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { getFieldPropsWithHelpText } from 'src/utils/formik';

import { getSensorConfigMqtt } from 'src/api/sensors';
import { currentRegionSelector } from 'src/recoil/regions';
import { requestHeadersSelector } from 'src/recoil/current-user';

const meshtasticClient = new Client();

const isSerialSupported = 'serial' in navigator;

const validationSchema = Yup.object()
  .shape({
    isUplink: Yup.boolean().required('Uplink Node is required'),
  })
  .when(([values], schema) => {
    if (values.isUplink) {
      return schema.shape({
        wifiSsid: Yup.string().required('Network SSID is required'),
        wifiPsk: Yup.string().required('Network PSK is required'),
      });
    }
    return schema;
  });

const waitForPacket = (connection, event, { test = () => true, timeout = 10000 } = {}) =>
  new Promise((resolve, reject) => {
    const subscription = connection.events[event].subscribe((p) => {
      if (test(p)) {
        subscription.cancel();
        resolve(p);
      }
    });
    setTimeout(() => {
      subscription.cancel();
      reject(new Error('timeout'));
    }, timeout);
  });

const createMeshtasticConfig = ({
  isUplink,
  wifiSsid,
  wifiPsk,
  channelPsk,
  mqttAddress,
  mqttUsername,
  mqttPassword,
}) => ({
  channels: [
    Protobuf.Channel.Channel.fromJson({
      index: 0,
      settings: {
        channelNum: 0,
        psk: channelPsk,
        name: '',
        id: 0,
        uplinkEnabled: isUplink,
        downlinkEnabled: false, // TODO: maybe this can be used to configure the nodes remotely??
      },
      role: 'PRIMARY',
    }),
  ],
  configs: [
    isUplink
      ? Protobuf.Config.Config.fromJson({
          network: {
            wifiEnabled: true,
            wifiSsid,
            wifiPsk,
            ntpServer: '0.pool.ntp.org',
            ethEnabled: false,
            addressMode: 'DHCP',
            ipv4Config: {
              ip: 0,
              gateway: 0,
              subnet: 0,
              dns: 0,
            },
            rsyslogServer: '',
          },
        })
      : undefined,
    Protobuf.Config.Config.fromJson({
      bluetooth: {
        enabled: false,
        mode: 'FIXED_PIN',
        fixedPin: 123456,
      },
    }),
    Protobuf.Config.Config.fromJson({
      lora: {
        usePreset: true,
        modemPreset: 'MEDIUM_FAST', // 'LONG_SLOW'
        bandwidth: 0,
        spreadFactor: 0,
        codingRate: 0,
        frequencyOffset: 0,
        region: 'US',
        hopLimit: 10, // default: 3
        txEnabled: true,
        txPower: 30,
        channelNum: 0,
        overrideDutyCycle: false,
        sx126xRxBoostedGain: true,
        overrideFrequency: 0,
        ignoreIncoming: [],
        ignoreMqtt: false,
      },
    }),
    Protobuf.Config.Config.fromJson({
      device: {
        role: 'CLIENT',
        serialEnabled: true,
        debugLogEnabled: false,
        buttonGpio: 0,
        buzzerGpio: 0,
        rebroadcastMode: 'ALL',
        nodeInfoBroadcastSecs: 10800,
        doubleTapAsButtonPress: false,
        isManaged: false, // maybe this can be used to configure the nodes remotely??
        disableTripleClick: true,
      },
    }),
  ],
  moduleConfigs: [
    Protobuf.ModuleConfig.ModuleConfig.fromJson({
      serial: {
        enabled: true,
        echo: true, // TODO: maybe this can be disabled?
        rxd: 9,
        txd: 8,
        baud: 'BAUD_DEFAULT',
        timeout: 0,
        mode: 'TEXTMSG',
        overrideConsoleSerialPort: false,
      },
    }),
    isUplink
      ? Protobuf.ModuleConfig.ModuleConfig.fromJson({
          mqtt: {
            enabled: true,
            address: mqttAddress,
            username: mqttUsername,
            password: mqttPassword,
            encryptionEnabled: false,
            jsonEnabled: true,
            tlsEnabled: false,
            root: 'msh',
            proxyToClientEnabled: false,
          },
        })
      : undefined,
  ],
});

export const doMeshtasticWork = async ({
  headers,
  isUplink = false,
  wifiSsid = '',
  wifiPsk = '',
  region: { channelPsk, id: regionId },
} = {}) => {
  if (isUplink && (!wifiSsid || !wifiPsk)) {
    throw new Error('wifiSsid and wifiPsk are required for uplink nodes');
  }

  const connection = meshtasticClient.createSerialConnection();

  try {
    if (connection.port === undefined) {
      await connection.connect({});
    }

    const configurationSettings = {
      isUplink,
      wifiSsid,
      wifiPsk,
      channelPsk,
      mqttAddress: '',
      mqttUsername: '',
      mqttPassword: '',
    };

    if (isUplink) {
      const mqttConfig = await getSensorConfigMqtt(headers);
      configurationSettings.mqttAddress = mqttConfig.host;
      configurationSettings.mqttUsername = mqttConfig.username;
      configurationSettings.mqttPassword = mqttConfig.password;
      // TODO: add tls and encryption settings
    }

    const configuration = createMeshtasticConfig(configurationSettings);

    const [deviceUser] = await Promise.all([
      waitForPacket(connection, 'onUserPacket'),
      waitForPacket(connection, 'onDeviceStatus', {
        test: (value) => value === 7,
      }),
    ]);

    await Promise.all([
      ...configuration.channels.filter((v) => v).map((channel) => connection.setChannel(channel)),
      ...configuration.configs.filter((v) => v).map((config) => connection.setConfig(config)),
      ...configuration.moduleConfigs
        .filter((v) => v)
        .map((moduleConfig) => connection.setModuleConfig(moduleConfig)),
    ]);
    await connection?.commitEditSettings();

    const deviceUserData = deviceUser.data.toJson();

    return {
      nodeId: deviceUserData.id,
      macAddress: deviceUserData.macaddr,
      uplink: isUplink,
      regionId,
    };
  } finally {
    await connection.disconnect();
  }
};

export default function NewSensorModal({ open, handleClose }) {
  const headers = useRecoilValue(requestHeadersSelector);

  const formik = useFormik({
    initialValues: {
      isUplink: false,
      wifiSsid: '',
      wifiPsk: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const newSensorIn = await doMeshtasticWork({
        headers,
        isUplink: values.isUplink,
        wifiSsid: values.wifiSsid,
        wifiPsk: values.wifiPsk,
        region,
      });

      innerHandleClose(newSensorIn);
    },
  });

  const region = useRecoilValue(currentRegionSelector);
  const innerHandleClose = (values) => {
    formik.resetForm();
    handleClose(values);
  };

  if (!region) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={() => innerHandleClose(null)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <DialogTitle>New Sensor</DialogTitle>
      {isSerialSupported ? (
        <>
          <DialogContent>
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
                    {...getFieldPropsWithHelpText(formik, 'wifiSsid')}
                  />
                  <TextField
                    fullWidth
                    label="Network PSK"
                    {...getFieldPropsWithHelpText(formik, 'wifiPsk')}
                  />
                </Stack>
              </FormGroup>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={formik.handleSubmit}
              disabled={!isSerialSupported || !formik.isValid}
            >
              Register
            </Button>
            <Button variant="contained" onClick={() => innerHandleClose(null)} color="error">
              Cancel
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <DialogContentText>
              Your browser does not support serial connections. Please try using Chrome.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => innerHandleClose(null)}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

NewSensorModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
