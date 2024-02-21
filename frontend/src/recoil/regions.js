import { recoilPersist } from 'recoil-persist';
import { atom, selector, selectorFamily, useRecoilState, useSetRecoilState } from 'recoil';

import * as api from 'src/api/regions';

const { persistAtom } = recoilPersist();

export const regionsDefault = selector({
  key: 'regions/default',
  get: () => api.getRegions(),
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

export const useCreateRegion = () => {
  const [regions, setRegions] = useRecoilState(regionsAtom);
  const setSelectedRegion = useSetRecoilState(currentRegionIdAtom);
  return async (region) => {
    const newRegion = await api.createRegion(region);
    setRegions([...regions, newRegion]);
    setSelectedRegion(newRegion.id);
    return newRegion;
  };
};
