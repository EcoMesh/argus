import { atom, selector, useRecoilCallback } from 'recoil';

import * as api from 'src/api/alarms';
import { currentRegionIdAtom } from 'src/recoil/regions';
import { requestHeadersSelector } from 'src/recoil/current-user';

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

export const currentRegionAlarmsAtom = selector({
  key: 'selectedRegionAlarms',
  get: ({ get }) => {
    const alarms = get(alarmsAtom);
    const selectedRegionId = get(currentRegionIdAtom);

    if (!selectedRegionId) return [];

    return alarms.filter(({ regionId }) => regionId === selectedRegionId);
  },
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
