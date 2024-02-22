import { atom } from 'recoil';

export const databaseAtom = atom({
  key: 'database',
  default: 'test',
});
