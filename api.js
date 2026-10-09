async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the notes service. Start the backend and verify its MongoDB connection.');
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || (response.status >= 500
      ? 'The notes service is unavailable. Check the backend and MongoDB connection.'
      : 'The request could not be completed.'));
  }
  if (!payload || typeof payload !== 'object') throw new Error('The server returned an invalid response.');
  return payload;
}

export const notesApi = {
  list: (search = '') => request(`/api/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (note) => request('/api/notes', { method: 'POST', body: JSON.stringify(note) }),
  update: (id, note) => request(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) }),
  remove: (id) => request(`/api/notes/${id}`, { method: 'DELETE' }),
};
