import { produce } from 'immer';
import { atom, selector, selectorFamily } from 'recoil';
import { groupBy as _groupBy, mapValues as _mapValues, round as _round } from 'lodash';

import * as api from 'src/api/sensor-readings';
import { currentRegionSensorsSelector } from 'src/recoil/sensors';

import { requestHeadersSelector } from './current-user';

export const rawSensorReadingsDefault = selector({
  key: 'sensorReadingsRaw/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);

    return api.getSensorReadings(headers);
  },
});

export const rawSensorReadingsAtom = atom({
  key: 'sensorReadingsRaw',
  default: rawSensorReadingsDefault,
});

export const sensorReadingsSelector = selector({
  key: 'sensorReadings/default',
  get: ({ get }) => get(rawSensorReadingsAtom).readings,
});

export const currentRegionSensorReadingsSelector = selector({
  key: 'selectedRegionSensorReadings',
  get: ({ get }) => {
    const sensorReadings = get(sensorReadingsSelector);
    const currentRegionSensors = get(currentRegionSensorsSelector);

    if (currentRegionSensors.length === 0) return [];

    const sensorNodeIds = new Set(currentRegionSensors.map(({ nodeId }) => nodeId));

    return sensorReadings.filter(({ nodeId }) => sensorNodeIds.has(nodeId));
  },
});

export const currentRegionSensorReadingsGroupedByNodeIdSelector = selector({
  key: 'selectedRegionSensorReadingsGroupedByNodeId',
  get: ({ get }) => {
    const sensorReadings = get(currentRegionSensorReadingsSelector);
    return _groupBy(sensorReadings, 'nodeId');
  },
});

export const currentRegionSensorReadingsFilterSelector = selectorFamily({
  key: 'currentRegionSensorReadingsFilter',
  get:
    ({ startTime, resolution }) =>
    ({ get }) => {
      let groups = get(currentRegionSensorReadingsGroupedByNodeIdSelector);

      // filter out readings that are older than startTime
      if (startTime) {
        groups = produce(groups, (draft) => {
          Object.keys(draft).forEach((nodeId) => {
            draft[nodeId] = draft[nodeId].filter(
              ({ timestamp }) => new Date(timestamp) >= startTime
            );
          });
        });
      }

      // average the readings based on the resolution
      if (resolution) {
        groups = produce(groups, (draft) => {
          Object.keys(draft).forEach((nodeId) => {
            const resolutionGroups = _groupBy(
              groups[nodeId],
              (reading) =>
                new Date(reading.timestamp).getTime() -
                (new Date(reading.timestamp).getTime() % resolution)
            );

            draft[nodeId] = Object.entries(resolutionGroups).map(([timestamp, values]) => {
              const averages = _mapValues(
                values.reduce(
                  (acc, reading) => ({
                    temperature: acc.temperature + reading.temperature,
                    humidity: acc.humidity + reading.humidity,
                    moisture: acc.moisture + reading.moisture,
                    groundDistance: acc.groundDistance + reading.groundDistance,
                  }),
                  {
                    temperature: 0,
                    humidity: 0,
                    moisture: 0,
                    groundDistance: 0,
                  }
                ),
                (value) => Math.round((value / values.length) * 100) / 100
              );

              return {
                timestamp: new Date(parseInt(timestamp, 10)).toISOString(),
                nodeId,
                ...averages,
              };
            });
          });
        });
      }
      return groups;
    },
});

export const currentRegionSensorReadingsChartSelector = selectorFamily({
  key: 'currentRegionSensorReadingsChart',
  get:
    ({ column, startTime, resolution }) =>
    ({ get }) => {
      const readingsGroupedBySensors = get(
        currentRegionSensorReadingsFilterSelector({ startTime, resolution })
      );
      const sensors = Object.entries(readingsGroupedBySensors).map(([nodeId, values]) => ({
        nodeId,
        values,
      }));

      return {
        labels: [],
        series: sensors.map((reading) => ({
          name: reading.nodeId,
          fill: 'gradient',
          type: 'area',
          data: reading.values.map((r) => ({
            x: r.timestamp,
            y: _round(r[column], 2),
          })),
        })),
        xaxis: {
          type: 'datetime',
        },
        options: {
          stroke: {
            curve: 'monotoneCubic',
          },
        },
      };
    },
});
