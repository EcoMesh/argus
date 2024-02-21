import { produce } from 'immer';
import { atom, selector, useRecoilState, selectorFamily, useSetRecoilState } from 'recoil';

import * as api from 'src/api/sensor-readings';
import { currentRegionSensorsSelector } from 'src/recoil/sensors';

export const sensorReadingsDefault = selector({
  key: 'sensorReadings/default',
  get: () => api.getSensorReadings(),
});

export const sensorReadingsAtom = atom({
  key: 'sensorReadings',
  default: sensorReadingsDefault,
});

export const selectedRegionSensorReadingsSelector = selector({
  key: 'selectedRegionSensorReadings',
  get: ({ get }) => {
    const sensorReadings = get(sensorReadingsAtom);
    console.log('sensorReadings', sensorReadings);
    const currentRegionSensors = get(currentRegionSensorsSelector);

    if (currentRegionSensors.length === 0) return [];

    const sensorNodeIds = new Set(currentRegionSensors.map(({ nodeId }) => nodeId));

    console.log('sensorNodeIds', sensorNodeIds);

    return sensorReadings.filter(({ nodeId }) => sensorNodeIds.has(nodeId));
  },
});
