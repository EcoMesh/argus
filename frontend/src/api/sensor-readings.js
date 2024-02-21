import { get } from './fetch';

export function getSensorReadings() {
  return get('/readings/');
}
