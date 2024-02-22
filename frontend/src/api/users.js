import { get, post } from './fetch';

export function login({ email, password }) {
  return post('/users/login', { email, password });
}

export async function signup({ name, email, password }) {
  return post('/users/signup', { name, email, password });
}

export async function getUsers(headers) {
  return get(`/users/`, { headers });
}

export async function getUser(id, headers) {
  return get(`/users/${id}`, { headers }); // TODO: implement server side
}
