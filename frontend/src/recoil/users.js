import { atom, selector } from 'recoil';

import * as api from 'src/api/users';

import { requestHeadersSelector } from './current-user';

const usersDefaultSelector = selector({
  key: 'users/default',
  get: ({ get }) => {
    const headers = get(requestHeadersSelector);
    return api.getUsers(headers);
  },
});

export const usersAtom = atom({
  key: 'users',
  default: usersDefaultSelector,
});
