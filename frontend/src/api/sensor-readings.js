import { get } from './fetch';

export function getSensorReadings(headers, { since } = {}) {
  const url = since ? `/readings/?since=${since}` : '/readings/';
  return get(url, { headers });
}
