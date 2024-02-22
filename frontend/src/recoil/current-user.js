import { atom, selector, useRecoilTransaction_UNSTABLE } from 'recoil';

import * as api from 'src/api/users';
import { databaseAtom } from 'src/recoil/database';

const isAccessTokenValid = (accessToken) => {
  if (!accessToken) return false;
  const { exp } = JSON.parse(atob(accessToken.split('.')[1]));
  return exp * 1000 > Date.now();
};

export const currentUserAtom = atom({
  key: 'currentUser',
  default: null,
  effects_UNSTABLE: [
    // persistAtom,
    ({ onSet, setSelf }) => {
      const existingCurrentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

      if (existingCurrentUser && isAccessTokenValid(existingCurrentUser.accessToken)) {
        setSelf(existingCurrentUser);
      }

      onSet((newCurrentUser) => {
        localStorage.setItem('currentUser', JSON.stringify(newCurrentUser));
      });
    },
  ],
});

export const requestHeadersSelector = selector({
  key: 'requestHeaders',
  get: ({ get }) => {
    const user = get(currentUserAtom);
    const database = get(databaseAtom);
    const headers = {};

    if (user) {
      headers.Authorization = `Bearer ${user.accessToken}`;
    }

    if (database) {
      headers['X-Database'] = database;
    }

    return headers;
  },
});

export const useLogin = () =>
  useRecoilTransaction_UNSTABLE(({ set }) => async ({ email, password }) => {
    const user = await api.login({ email, password });
    set(currentUserAtom, user);
    return user;
  });
