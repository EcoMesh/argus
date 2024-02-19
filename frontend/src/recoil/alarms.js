import { atom, selector, useRecoilState } from 'recoil';

import * as api from 'src/api/alarms';
import { selectedRegionIdAtom } from 'src/recoil/regions';

export const alarmsDefault = selector({
  key: 'alarms/default',
  get: () => api.getAlarms(),
});

export const alarmsAtom = atom({
  key: 'alarms',
  default: alarmsDefault,
});

export const selectedRegionAlarmsAtom = selector({
  key: 'selectedRegionAlarms',
  get: ({ get }) => {
    const alarms = get(alarmsAtom);
    const selectedRegionId = get(selectedRegionIdAtom);

    if (!selectedRegionId) return [];

    return alarms.filter(({ regionId }) => regionId === selectedRegionId);
  },
});

export const useCreateAlarm = () => {
  const [alarms, setAlarms] = useRecoilState(alarmsAtom);
  return async (alarm) => {
    const newAlarm = await api.createAlarm(alarm);
    setAlarms([...alarms, newAlarm]);
    return newAlarm;
  };
};