import { get } from './fetch';

export function getSensorReadings(headers) {
  return get('/readings/', { headers });
}
