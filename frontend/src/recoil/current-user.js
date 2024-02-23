import { atom, selector, useRecoilTransaction_UNSTABLE } from 'recoil';

import * as api from 'src/api/users';

const isAccessTokenValid = (accessToken) => {
  if (!accessToken) return false;
  const { exp } = JSON.parse(atob(accessToken.split('.')[1]));
  return exp * 1000 > Date.now();
};

export const currentUserAtom = atom({
  key: 'currentUser',
  default: null,
  effects_UNSTABLE: [
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

    if (user) {
      return {
        Authorization: `Bearer ${user.accessToken}`,
      };
    }

    return {};
  },
});

export const useLogin = () =>
  useRecoilTransaction_UNSTABLE(({ set }) => async ({ email, password }) => {
    const user = await api.login({ email, password });
    set(currentUserAtom, user);
    return user;
  });
