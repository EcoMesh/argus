import { post, remove } from './fetch';

export function login({ email, password }) {
  return post('/users/login', { email, password });
}

export async function signup({ name, email, password }) {
  return post('/users/signup', { name, email, password });
}

export async function getUsers() {
  return remove(`/users/`);
}

export async function getUser(id) {
  return remove(`/users/${id}`); // TODO: implement server side
}
