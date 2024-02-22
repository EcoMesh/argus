import { recoilPersist } from 'recoil-persist';
import { atom, useRecoilCallback } from 'recoil';

import * as api from 'src/api/users';

const { persistAtom } = recoilPersist();

export const currentUserAtom = atom({
  key: 'currentUser',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const useLogin = () => useRecoilCallback(({ set }) => async ({ email, password }) => {
    const user = await api.login({ email, password });
    set(currentUserAtom, user);
    return user;
  });
