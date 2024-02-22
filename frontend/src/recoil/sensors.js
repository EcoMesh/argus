import { produce } from 'immer';
import { atom, selector, selectorFamily, useRecoilCallback } from 'recoil';

import * as api from 'src/api/sensors';
import { currentRegionIdAtom } from 'src/recoil/regions';

import { requestHeadersSelector } from './current-user';

export const sensorDefault = selector({
  key: 'sensor/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);
    return api.getSensors(headers);
  },
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

export const currentRegionSensorsSelector = selector({
  key: 'selectedRegionSensors',
  get: ({ get }) => {
    const sensors = get(sensorsAtom);
    const selectedRegionId = get(currentRegionIdAtom);

    if (!selectedRegionId) return [];

    return sensors.filter(({ regionId }) => regionId === selectedRegionId);
  },
});

export const useRefreshSensors = () =>
  useRecoilCallback(({ set, snapshot }) => async () => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const newSensors = await api.getSensors(headers);
    set(sensorsAtom, newSensors);
  });

export const useCreateSensor = () =>
  useRecoilCallback(({ set, snapshot }) => async (sensor) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const newSensor = await api.createSensor(sensor, headers);
    set(sensorsAtom, (oldSensors) => [...oldSensors, newSensor]);
    return newSensor;
  });

export const useInitSensor = () =>
  useRecoilCallback(({ set, snapshot }) => async (sensorJwtIdentifier, { lat, lon }) => {
    const headers = await snapshot.getPromise(requestHeadersSelector); // TODO: store database in JWT token
    
    const updatedSensor = await api.initSensor(sensorJwtIdentifier, { lat, lon }, headers);
    set(sensorsAtom, (oldSensors) => {
      // the user is not logged in
      if (oldSensors.length === 0) return [];

      const index = oldSensors.findIndex((s) => s.id === updatedSensor.id);
      return produce(oldSensors, (draft) => {
        draft[index] = updatedSensor;
      });
    });
    return updatedSensor;
  });

export const useDeleteSensor = () =>
  useRecoilCallback(({ set, snapshot }) => async (sensorId) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    await api.deleteSensor(sensorId, headers);
    set(sensorsAtom, (oldSensors) => oldSensors.filter((sensor) => sensor.id !== sensorId));
  });
