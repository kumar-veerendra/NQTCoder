/**
 * sanitizeHtml.js — Server-side HTML sanitization for TipTap rich content.
 * No external dependency — pure regex allowlist approach.
 * Defense-in-depth: strips dangerous content before storage.
 */

/**
 * Sanitize HTML string from TipTap editor before saving to MongoDB.
 * Strips scripts, iframes, event handlers, and dangerous protocol URLs.
 *
 * @param {string} html - Raw HTML from TipTap
 * @returns {string} - Sanitized HTML safe for storage and rendering
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  let s = html;

  // 1. Remove entire dangerous block elements and their content
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  s = s.replace(/<iframe\b[^>]*>.*?<\/iframe>/gis, '');
  s = s.replace(/<object\b[^>]*>.*?<\/object>/gis, '');
  s = s.replace(/<embed\b[^>]*\/?>/gi, '');
  s = s.replace(/<form\b[^>]*>.*?<\/form>/gis, '');
  s = s.replace(/<input\b[^>]*\/?>/gi, '');
  s = s.replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '');
  s = s.replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '');
  s = s.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
  s = s.replace(/<base\b[^>]*>/gi, '');
  s = s.replace(/<meta\b[^>]*>/gi, '');
  s = s.replace(/<link\b[^>]*>/gi, '');

  // 2. Remove all on* event handler attributes globally
  s = s.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // 3. Remove dangerous protocol values in href, src, action, formaction
  s = s.replace(
    /(\s+(?:href|src|action|formaction)\s*=\s*)("([^"]*)"|'([^']*)'|([^\s>]*))/gi,
    (match, attr, quoted, dq, sq, unquoted) => {
      const val = (dq || sq || unquoted || '').trim();
      if (/^(javascript|data|vbscript|file):/i.test(val)) {
        return ''; // strip the entire attribute
      }
      return match;
    }
  );

  // 4. Add rel="noopener noreferrer" to all target="_blank" links
  s = s.replace(
    /<a\b([^>]*target\s*=\s*["']_blank["'][^>]*)>/gi,
    (match, attrs) => {
      if (/rel\s*=/i.test(attrs)) return match;
      return `<a${attrs} rel="noopener noreferrer">`;
    }
  );

  return s;
}

export default sanitizeHtml;
