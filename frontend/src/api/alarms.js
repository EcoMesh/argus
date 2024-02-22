import { get, post, remove, put } from './fetch';

export function getAlarms() {
  return get('/alarms/');
}

export async function createAlarm(data) {
  return post('/alarms/', data);
}

export async function deleteAlarm(id) {
  return remove(`/alarms/${id}`);
}

export async function updateAlarm(data) {
  return put(`/alarms/${data.id}`, data);
}
