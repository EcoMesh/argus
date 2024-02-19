import { get, post } from './fetch';

export async function createAlarm(data) {
  return post('/alarms/', data);
}

export function getAlarms() {
  return get('/alarms/');
}
