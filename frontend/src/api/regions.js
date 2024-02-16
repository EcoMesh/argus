import { post } from './fetch.js';

export function createRegion(data) {
  return post('/regions/', data);
}
