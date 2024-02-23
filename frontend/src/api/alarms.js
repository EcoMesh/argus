import { get, put, post, remove } from './fetch';

export function getAlarms(headers = {}) {
  return get('/alarms/', { headers });
}

export function getAlarmNotificationHistory(headers = {}) {
  return get('/alarms/notifications', { headers });
}

export async function createAlarm(data, headers = {}) {
  return post('/alarms/', data, { headers });
}

export async function deleteAlarm(id, headers = {}) {
  return remove(`/alarms/${id}`, { headers });
}

export async function updateAlarm(data, headers = {}) {
  return put(`/alarms/${data.id}`, data, { headers });
}
