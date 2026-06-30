/**
 * SEO.jsx — Centralised head management component for NQTCoder
 *
 * Uses react-helmet-async to inject per-page:
 *   - <title> and <meta name="description">
 *   - <link rel="canonical"> (always www.nqtcoder.dev)
 *   - Open Graph tags
 *   - Twitter Card tags
 *   - Robots directive
 *   - JSON-LD structured data (optional)
 *
 * SEO signals (canonical, OG, sitemap) ALWAYS reference www.nqtcoder.dev
 * regardless of which domain the user is currently on.
 * This prevents duplicate-content issues while keeping both domains functional.
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

// The single canonical domain — NEVER changes, regardless of which domain
// the visitor arrived from (nqtcoder.vercel.app also works but is not canonical)
const CANONICAL_BASE = 'https://www.nqtcoder.dev';
const OG_IMAGE       = `${CANONICAL_BASE}/og-image.png`;
const SITE_NAME      = 'NQTCoder';
const TWITTER_HANDLE = '@nqtcoder'; // update if you create a Twitter/X account

/**
 * @param {string}  title          - Page title (without site name suffix)
 * @param {string}  description    - Meta description (120-160 chars ideal)
 * @param {string}  [path='/']     - Canonical path, e.g. '/practice'
 * @param {string}  [ogImage]      - Absolute URL to OG image (defaults to og-image.png)
 * @param {string}  [ogType]       - OG type: 'website' | 'article' (default: 'website')
 * @param {string}  [keywords]     - Comma-separated keywords
 * @param {boolean} [noIndex]      - If true, adds noindex,nofollow robots meta
 * @param {object}  [jsonLd]       - JSON-LD object (or array) to inject as <script type="application/ld+json">
 */
const SEO = ({
  title,
  description,
  path = '/',
  ogImage = OG_IMAGE,
  ogType = 'website',
  keywords = '',
  noIndex = false,
  jsonLd = null,
}) => {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${CANONICAL_BASE}${path === '/' ? '' : path}`;

  // Normalise jsonLd: always wrap in array for consistent serialisation
  const schemas = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Robots ───────────────────────────────────────────────── */}
      {noIndex
        ? <meta name="robots" content="noindex,nofollow" />
        : <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
      }

      {/* ── Open Graph ───────────────────────────────────────────── */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={ogType} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"   content={`${SITE_NAME} — ${title}`} />
      <meta property="og:locale"      content="en_IN" />

      {/* ── Twitter Card ─────────────────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={`${SITE_NAME} — ${title}`} />

      {/* ── JSON-LD Structured Data ──────────────────────────────── */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
        />
      ))}
    </Helmet>
  );
};

export default SEO;
