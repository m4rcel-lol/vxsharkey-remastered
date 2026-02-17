import { request } from 'undici';
import { cache } from '../server.js';

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 10000;

/**
 * Fetches note details from a Misskey/Sharkey instance
 */
export async function fetchNote(domain, noteId) {
  const cacheKey = `note:${domain}:${noteId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiUrl = `https://${domain}/api/notes/show`;
    const { statusCode, body } = await request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId }),
      bodyTimeout: REQUEST_TIMEOUT,
      headersTimeout: REQUEST_TIMEOUT,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch note: ${statusCode}`);
    }

    const data = await body.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching note from ${domain}:`, error);
    throw error;
  }
}

/**
 * Fetches user profile from a Misskey/Sharkey instance
 */
export async function fetchUser(domain, username) {
  const cacheKey = `user:${domain}:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiUrl = `https://${domain}/api/users/show`;
    const { statusCode, body } = await request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, host: null }),
      bodyTimeout: REQUEST_TIMEOUT,
      headersTimeout: REQUEST_TIMEOUT,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch user: ${statusCode}`);
    }

    const data = await body.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching user from ${domain}:`, error);
    throw error;
  }
}

/**
 * Fetches instance metadata
 */
export async function fetchInstanceMeta(domain) {
  const cacheKey = `instance:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiUrl = `https://${domain}/api/meta`;
    const { statusCode, body } = await request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ detail: true }),
      bodyTimeout: REQUEST_TIMEOUT,
      headersTimeout: REQUEST_TIMEOUT,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch instance meta: ${statusCode}`);
    }

    const data = await body.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching instance meta from ${domain}:`, error);
    throw error;
  }
}

/**
 * Fetches recent public notes from instance
 */
export async function fetchInstanceNotes(domain, limit = 20) {
  const cacheKey = `instance-notes:${domain}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiUrl = `https://${domain}/api/notes/local-timeline`;
    const { statusCode, body } = await request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit }),
      bodyTimeout: REQUEST_TIMEOUT,
      headersTimeout: REQUEST_TIMEOUT,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch instance notes: ${statusCode}`);
    }

    const data = await body.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching instance notes from ${domain}:`, error);
    throw error;
  }
}

/**
 * Fetches user's notes
 */
export async function fetchUserNotes(domain, userId, limit = 20) {
  const cacheKey = `user-notes:${domain}:${userId}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiUrl = `https://${domain}/api/users/notes`;
    const { statusCode, body } = await request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, limit }),
      bodyTimeout: REQUEST_TIMEOUT,
      headersTimeout: REQUEST_TIMEOUT,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch user notes: ${statusCode}`);
    }

    const data = await body.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching user notes from ${domain}:`, error);
    throw error;
  }
}
