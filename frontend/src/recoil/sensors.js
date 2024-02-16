import { atom, selector, useRecoilState } from 'recoil';

import * as api from 'src/api/sensors';
import { selectedRegionIdAtom } from 'src/recoil/regions';

export const sensorDefault = selector({
  key: 'sensor/default',
  get: () => api.getSensors(),
});

export const sensorsAtom = atom({
  key: 'sensor',
  default: sensorDefault,
});

export const selectedRegionSensorsAtom = selector({
  key: 'selectedRegionSensors',
  get: ({ get }) => {
    const sensors = get(sensorsAtom);
    const selectedRegionId = get(selectedRegionIdAtom);

    if (!selectedRegionId) return [];

    return sensors.filter(({ regionId }) => regionId === selectedRegionId);
  },
});

export const useCreateSensor = () => {
  const [sensors, setSensors] = useRecoilState(sensorsAtom);
  return async (sensor) => {
    const newSensor = await api.createSensor(sensor);
    setSensors([...sensors, newSensor]);
    return newSensor;
  };
};
