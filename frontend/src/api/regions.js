import { get, post } from './fetch';

export async function createRegion(data) {
  return post('/regions/', data);
}

export function getRegions() {
  return get('/regions/');
}
