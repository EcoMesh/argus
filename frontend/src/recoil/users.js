import { atom, selector } from 'recoil';

import * as api from 'src/api/users';

const usersDefaultSelector = selector({
  key: 'users/default',
  get: () => api.getUsers(),
});

export const usersAtom = atom({
  key: 'users',
  default: usersDefaultSelector,
});
