import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content from notes
 */
export function sanitizeNoteContent(html) {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'span',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    allowedAttributes: {
      'a': ['href', 'class', 'rel'],
      'span': ['class'],
      'code': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        };
      },
    },
  });
}

/**
 * Strips all HTML tags for plain text
 */
export function stripHtml(html) {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text, maxLength = 200) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
