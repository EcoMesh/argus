import { get, post } from './fetch';

export async function createRegion(data, headers = {}) {
  return post('/regions/', data, { headers });
}

export function getRegions(headers = {}) {
  return get('/regions/', { headers });
}
