import { produce } from 'immer';
import { atom, selector, useRecoilState, selectorFamily, useSetRecoilState } from 'recoil';

import * as api from 'src/api/sensors';
import { currentRegionIdAtom } from 'src/recoil/regions';

export const sensorDefault = selector({
  key: 'sensor/default',
  get: () => api.getSensors(),
});

export const sensorsAtom = atom({
  key: 'sensor',
  default: sensorDefault,
});

export const sensorByIdSelector = selectorFamily({
  key: 'selectSensorById',
  get:
    (id) =>
    ({ get }) => {
      const sensors = get(sensorsAtom);
      return sensors.find((sensor) => sensor.id === id);
    },
});

export const selectedRegionSensorsAtom = selector({
  key: 'selectedRegionSensors',
  get: ({ get }) => {
    const sensors = get(sensorsAtom);
    const selectedRegionId = get(currentRegionIdAtom);

    if (!selectedRegionId) return [];

    return sensors.filter(({ regionId }) => regionId === selectedRegionId);
  },
});

export const useRefreshSensors = () => {
  const setSensors = useSetRecoilState(sensorsAtom);
  return async () => {
    const newSensors = await api.getSensors();
    setSensors(newSensors);
  };
};

export const useCreateSensor = () => {
  const [sensors, setSensors] = useRecoilState(sensorsAtom);
  return async (sensor) => {
    const newSensor = await api.createSensor(sensor);
    setSensors([...sensors, newSensor]);
    return newSensor;
  };
};

export const useInitSensor = () => {
  const [sensors, setSensors] = useRecoilState(sensorsAtom);
  return async (sensorJwtIdentifier, { lat, lon }) => {
    const sensor = await api.initSensor(sensorJwtIdentifier, { lat, lon });
    const index = sensors.findIndex((s) => s.id === sensor.id);

    setSensors(
      produce(sensors, (draft) => {
        draft[index] = sensor;
      })
    );
  };
};

export const useDeleteSensor = () => {
  const [sensors, setSensors] = useRecoilState(sensorsAtom);
  return async (sensorId) => {
    await api.deleteSensor(sensorId);
    setSensors(sensors.filter((sensor) => sensor.id !== sensorId));
  };
};
