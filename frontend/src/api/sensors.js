import { get, post } from './fetch';

export async function createSensor(data) {
  return post('/sensors/', data);
}

export function getSensors() {
  return get('/sensors/');
}
