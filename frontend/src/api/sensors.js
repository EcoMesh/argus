import * as Yup from 'yup';

import { get, post, put, remove } from './fetch';

export async function createSensor(data, headers = {}) {
  return post('/sensors/', data, { headers });
}

export async function initSensor(sensorId, { lat, lon }, headers) {
  return post(`/sensors/${sensorId}/init`, { lat, lon }, { headers });
}

export function getSensors(headers = {}) {
  return get('/sensors/', { headers });
}

export function deleteSensor(id, headers = {}) {
  return remove(`/sensors/${id}`, { headers });
}

export function putSensor(sensorId, data, headers = {}) {
  return put(`/sensors/${sensorId}`, data, { headers });
}

const sensorConfigMqttSchema = Yup.object().shape({
  host: Yup.string().required('Host is required'),
  username: Yup.string(),
  password: Yup.string(),
  useTls: Yup.boolean().required('Use TLS is required'),
  useEncryption: Yup.boolean().required('Use Encryption is required'),
});

export async function getSensorConfigMqtt(headers = {}) {
  return sensorConfigMqttSchema.validate(await get('/sensors/config/mqtt', { headers }));
}
