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
  const data = await response.json();
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
  const init = { method: 'get', ...config };
  return http(path, init);
}

export function post(path, body, config) {
  const init = {
    method: 'post',
    body: JSON.stringify(body),
    ...config,
  };
  return http(path, init);
}

export function put(path, body, config) {
  const init = {
    method: 'put',
    body: JSON.stringify(body),
    ...config,
  };
  return http(path, init);
}
