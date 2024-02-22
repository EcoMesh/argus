import { recoilPersist } from 'recoil-persist';
import { atom, selector, selectorFamily, useRecoilCallback } from 'recoil';

import * as api from 'src/api/regions';

import { requestHeadersSelector } from './current-user';

const { persistAtom } = recoilPersist();

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
  effects_UNSTABLE: [persistAtom],
});

export const currentRegionSelector = selector({
  key: 'selectedRegion',
  get: ({ get }) => {
    const selectedRegionId = get(currentRegionIdAtom);
    if (!selectedRegionId) return null;
    return get(regionByIdSelector(selectedRegionId));
  },
});

export const useCreateRegion = () => useRecoilCallback(({ set, snapshot }) => async (region) => {
    const headers = await snapshot.getPromise(requestHeadersSelector);
    const newRegion = await api.createRegion(region, headers);
    set(regionsAtom, (oldRegions) => [...oldRegions, newRegion]);
    return newRegion;
  });
