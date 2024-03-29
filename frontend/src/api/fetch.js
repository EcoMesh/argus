// Assuming the necessary libraries are already imported in the environment where this code will run
class APIError extends Error {
  constructor({ name, message, request, response, data }) {
    super(message);
    this.name = name;
    this.request = request;
    this.response = response;
    this.data = data;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

const getApiBaseUrl = (url) => {
  if (url === undefined) {
    return '';
  }
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl(import.meta.env.API_BASE_URL);

async function http(path, config) {
  console.log('config', config);
  const prefixedPath = path.startsWith('http')
    ? path
    : `${API_BASE_URL}/api${path}`.replace(/\/+/g, '/');
  const request = new Request(prefixedPath, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  });
  const response = await fetch(request);

  const data = response.status !== 204 ? await response.json() : null;
  if (!response.ok) {
    // if (response.status === 403) {
    //   // TODO: Show a login dialog
    //   enqueueSnackbar(`You don't have permission to do that.`, { variant: 'error' });
    // } else if (data.message) {
    //   enqueueSnackbar(`${data.message}`, { variant: data.variant || 'error' });
    // } else {
    //   enqueueSnackbar(`Error ${response.status}: ${response.statusText}`, { variant: 'error' });
    // }
    const error = new APIError({
      name: String(response.status),
      message: response.statusText,
      request,
      response,
      data,
    });
    throw error;
  }

  return data;
}

export function get(path, config) {
  console.log('get path', path, config);
  return http(path, { method: 'get', ...config });
}

export function post(path, body, config) {
  return http(path, {
    method: 'post',
    body: JSON.stringify(body),
    ...config,
  });
}

export function put(path, body, config) {
  return http(path, {
    method: 'put',
    body: JSON.stringify(body),
    ...config,
  });
}

// delete is a reserved word in JavaScript
export function remove(path, config) {
  return http(path, { method: 'delete', ...config });
}
