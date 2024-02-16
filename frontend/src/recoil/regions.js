import { recoilPersist } from 'recoil-persist';
import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil';

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

export const selectedRegionIdAtom = atom({
  key: 'selectedRegionId',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const selectedRegionAtom = selector({
  key: 'selectedRegion',
  get: ({ get }) => {
    const regions = get(regionsAtom);
    const selectedRegionId = get(selectedRegionIdAtom);
    if (!selectedRegionId) return null;
    return regions.find((region) => region.id === selectedRegionId);
  },
});

export const useCreateRegion = () => {
  const [regions, setRegions] = useRecoilState(regionsAtom);
  const setSelectedRegion = useSetRecoilState(selectedRegionIdAtom);
  return async (region) => {
    console.log('Creating region', region);
    const data = await api.createRegion(region);
    console.log(data);
    setRegions([...regions, data]);
    setSelectedRegion(data.id);
    return data;
  };
};
