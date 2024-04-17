import { atom, selector, selectorFamily, useRecoilCallback } from 'recoil';

import * as api from 'src/api/alarms';
import { currentRegionIdAtom } from 'src/recoil/regions';
import { requestHeadersSelector } from 'src/recoil/current-user';
import { produce } from 'immer';

export const alarmsDefault = selector({
  key: 'alarms/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);
    return api.getAlarms(headers);
  },
});

export const alarmsAtom = atom({
  key: 'alarms',
  default: alarmsDefault,
});

export const alarmNotificationHistoryDefault = selector({
  key: 'alarmNotificationHistoryDefault/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);
    return api.getAlarmNotificationHistory(headers);
  },
});

export const alarmNotificationHistoryAtom = atom({
  key: 'alarmNotificationHistory',
  default: alarmNotificationHistoryDefault,
});

export const currentRegionAlarmsAtom = selector({
  key: 'selectedRegionAlarms',
  get: ({ get }) => {
    const alarms = get(alarmsAtom);
    const selectedRegionId = get(currentRegionIdAtom);

    if (!selectedRegionId) return [];

    return alarms.filter(({ regionId }) => regionId === selectedRegionId);
  },
});

export const currentRegionNotificationHistorySelector = selector({
  key: 'selectedRegionNotificationHistory',
  get: ({ get }) => {
    const notifications = get(alarmNotificationHistoryAtom);
    const regionalAlarms = get(currentRegionAlarmsAtom);

    const regionalAlarmIds = new Set(regionalAlarms.map(({ id }) => id));

    return notifications.filter(({ alarmId }) => regionalAlarmIds.has(alarmId));
  },
});

export const currentRegionRecentAlarmEventsSelector = selector({
  key: 'selectedRegionRecentAlarmEvents',
  get: ({ get }) => {
    const alarms = get(currentRegionAlarmsAtom);
    return alarms.flatMap(({ name, history }) =>
      history.map((event) => ({ ...event, alarmName: name }))
    );
  },
});

export const useSendNotification = () =>
  useRecoilCallback(({ set, snapshot }) => async (notificationId) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);

    try {
      const data = await api.sendNotification(notificationId, headers);
      console.log('11', data);
      set(
        alarmNotificationHistoryAtom,
        produce((oldNotifications) => {
          const index = oldNotifications.findIndex(({ id }) => id === notificationId);
          oldNotifications[index] = data;
        })
      );
      return data;
    } catch (error) {
      alert(error);
      return error;
    }
  });

export const useDismissNotification = () =>
  useRecoilCallback(({ set, snapshot }) => async (notificationId) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    try {
      const data = await api.dismissNotification(notificationId, headers);
      set(
        alarmNotificationHistoryAtom,
        produce((oldNotifications) => {
          const index = oldNotifications.findIndex(({ id }) => id === notificationId);
          oldNotifications[index] = data;
        })
      );
      return data;
    } catch (error) {
      alert(error);
      return error;
    }
  });

export const useCreateAlarm = () =>
  useRecoilCallback(({ set, snapshot }) => async (alarm) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const newAlarm = await api.createAlarm(alarm, headers);
    set(alarmsAtom, (oldAlarms) => [...oldAlarms, newAlarm]);
    return newAlarm;
  });

export const useDeleteAlarm = () =>
  useRecoilCallback(({ set, snapshot }) => async (alarmId) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    await api.deleteAlarm(alarmId, headers);
    set(alarmsAtom, (oldAlarms) => oldAlarms.filter((alarm) => alarm.id !== alarmId));
  });

export const useUpdateAlarm = () =>
  useRecoilCallback(({ set, snapshot }) => async (alarm) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const updatedAlarm = await api.updateAlarm(alarm, headers);
    set(alarmsAtom, (oldAlarms) =>
      oldAlarms.map((a) => (a.id === updatedAlarm.id ? updatedAlarm : a))
    );
    return updatedAlarm;
  });
