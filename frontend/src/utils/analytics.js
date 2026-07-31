/**
 * Utility functions for Google Analytics 4 (GA4) using the official window.gtag
 */

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-KNM0S28F9W';

/**
 * Sends a page_view event to Google Analytics 4
 * @param {string} path - The relative path including query params (e.g. '/practice?q=tcs')
 * @param {string} [title] - Optional page title
 */
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

/**
 * Tracks custom user events in Google Analytics 4
 * @param {string} action - Event name (e.g., 'submit_solution', 'start_test')
 * @param {object} [params] - Custom parameters for the event
 */
export const trackEvent = (action, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};
