import React from 'react';

// Injects stable slug-based IDs into H2/H3 headings for TOC anchor links
const injectHeadingIds = (html) => {
  if (!html) return '';
  return html.replace(/<(h[234])(\s[^>]*)?>([^<]+)<\/h[234]>/gi, (match, tag, attrs, text) => {
    const id = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<${tag} id="${id}"${attrs || ''}>${text}</${tag}>`;
  });
};

// Strips orphan/empty <li> bullet elements that contain no text
const removeEmptyBullets = (html) => {
  if (!html) return '';
  return html
    .replace(/<li>\s*(?:<p>\s*(?:&nbsp;|<br\s*\/?>)?\s*<\/p>|<br\s*\/?>|&nbsp;)?\s*<\/li>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '');
};

const GuideContent = ({ content }) => {
  if (!content || !content.trim()) return null;
  const processed = removeEmptyBullets(injectHeadingIds(content));
  return (
    <div
      className="guide-content"
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};

export default GuideContent;
