import * as Yup from 'yup';

import { get, post, remove } from './fetch';

export async function createSensor(data) {
  return post('/sensors/', data);
}

export async function initSensor(sensorId, { lat, lon }) {
  return post(`/sensors/${sensorId}/init`, { lat, lon });
}

export function getSensors() {
  return get('/sensors/');
}

export function deleteSensor(id) {
  return remove(`/sensors/${id}`);
}

const sensorConfigMqttSchema = Yup.object().shape({
  host: Yup.string().required('Host is required'),
  username: Yup.string(),
  password: Yup.string(),
  useTls: Yup.boolean().required('Use TLS is required'),
  useEncryption: Yup.boolean().required('Use Encryption is required'),
});

export async function getSensorConfigMqtt() {
  return sensorConfigMqttSchema.validate(await get('/sensors/config/mqtt'));
}

export async function setSensorInitializationUrl(data) {
  return post('/sensors/', data);
}
