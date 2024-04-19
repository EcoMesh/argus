import { atom, selector, selectorFamily, useRecoilCallback } from 'recoil';

import * as api from 'src/api/regions';

import { requestHeadersSelector } from './current-user';

export const regionsDefault = selector({
  key: 'regions/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);
    return api.getRegions(headers);
  },
});

export const regionsAtom = atom({
  key: 'regions',
  default: regionsDefault,
});

export const regionByIdSelector = selectorFamily({
  key: 'selectRegionById',
  get:
    (id) =>
    ({ get }) => {
      const regions = get(regionsAtom);
      return regions.find((region) => region.id === id);
    },
});

export const currentRegionIdAtom = atom({
  key: 'selectedRegionId',
  default: null,
  effects_UNSTABLE: [
    ({ onSet, setSelf, getPromise }) => {
      const currentRegionId = localStorage.getItem('currentRegionId');

      if (currentRegionId) {
        setSelf(currentRegionId);
        // TODO: maybe enable later, right now this is causing a race condition on login
        // getPromise(regionsAtom).then((regions) => {
        //   if (regions.find((region) => region.id === currentRegionId)) {  // only set if region still exists
        //     setSelf(currentRegionId);
        //   } else if (regions.length) {  // if region doesn't exist, set to first region
        //     localStorage.setItem('currentRegionId', regions[0].id);
        //     setSelf(regions[0].id);
        //   } else { // if no regions, clear currentRegionId
        //     localStorage.removeItem('currentRegionId');
        //     setSelf(null);
        //   }
        // });
      } else {
        getPromise(regionsAtom).then((regions) => {
          if (regions.length) {
            localStorage.setItem('currentRegionId', regions[0].id);
            setSelf(regions[0].id);
          }
        });
      }

      onSet((newRegionId) => {
        console.log('newRegionId', newRegionId);
        localStorage.setItem('currentRegionId', newRegionId);
      });
    },
  ],
});

export const currentRegionSelector = selector({
  key: 'selectedRegion',
  get: ({ get }) => {
    const selectedRegionId = get(currentRegionIdAtom);
    if (!selectedRegionId) return null;
    return get(regionByIdSelector(selectedRegionId));
  },
});

export const useCreateRegion = () =>
  useRecoilCallback(({ set, snapshot }) => async (region) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const newRegion = await api.createRegion(region, headers);
    set(regionsAtom, (oldRegions) => [...oldRegions, newRegion]);
    return newRegion;
  });
