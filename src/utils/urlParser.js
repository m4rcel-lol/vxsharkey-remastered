/**
 * Validates if a URL is safe to fetch (not private IP ranges)
 */
export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);

    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Block private IP ranges
    const hostname = url.hostname.toLowerCase();

    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Block private IP ranges
    if (
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Detects the content type from a Sharkey/Misskey URL
 */
export function detectContentType(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  if (pathname.includes('/notes/')) {
    const noteId = pathname.split('/notes/')[1].split('/')[0];
    return { type: 'note', id: noteId, domain: urlObj.hostname };
  }

  if (pathname.startsWith('/@')) {
    const username = pathname.substring(2).split('/')[0];
    return { type: 'profile', username, domain: urlObj.hostname };
  }

  if (pathname.includes('/users/')) {
    const userId = pathname.split('/users/')[1].split('/')[0];
    return { type: 'profile', userId, domain: urlObj.hostname };
  }

  return { type: 'instance', domain: urlObj.hostname };
}

/**
 * Extracts note ID from various URL formats
 */
export function extractNoteId(url) {
  const match = url.match(/\/notes\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Extracts username from profile URL
 */
export function extractUsername(url) {
  const match = url.match(/\/@([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
