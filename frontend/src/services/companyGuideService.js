/**
 * companyGuideService.js — API calls for Company Guides feature.
 * All public calls use the shared api.js axios instance.
 */
import api from './api';

// ── Public endpoints (no auth) ────────────────────────────────────────────────

export const getCompanies = async () => {
  const res = await api.get('/api/companies');
  return res.data;
};

export const getGuides = async (params = {}) => {
  const res = await api.get('/api/company-guides', { params });
  return res.data;
};

export const getFeaturedGuides = async () => {
  const res = await api.get('/api/company-guides/featured');
  return res.data;
};

export const getGuideBySlug = async (slug) => {
  const res = await api.get(`/api/company-guides/${slug}`);
  return res.data;
};

export const getGuideSlugs = async () => {
  const res = await api.get('/api/company-guides/sitemap');
  return res.data;
};

// ── Admin: Company CRUD ────────────────────────────────────────────────────────

export const adminGetCompanies = async () => {
  const res = await api.get('/api/admin/companies');
  return res.data;
};

export const adminCreateCompany = async (data) => {
  const res = await api.post('/api/admin/companies', data);
  return res.data;
};

export const adminUpdateCompany = async (id, data) => {
  const res = await api.patch(`/api/admin/companies/${id}`, data);
  return res.data;
};

// ── Admin: Guide CRUD ──────────────────────────────────────────────────────────

export const adminGetGuides = async (params = {}) => {
  const res = await api.get('/api/admin/guides', { params });
  return res.data;
};

export const adminGetGuideById = async (id) => {
  const res = await api.get(`/api/admin/guides/${id}`);
  return res.data;
};

export const adminCreateGuide = async (data) => {
  const res = await api.post('/api/admin/guides', data);
  return res.data;
};

export const adminUpdateGuide = async (id, data) => {
  const res = await api.patch(`/api/admin/guides/${id}`, data);
  return res.data;
};

export const adminPublishGuide = async (id) => {
  const res = await api.patch(`/api/admin/guides/${id}/publish`);
  return res.data;
};

export const adminUnpublishGuide = async (id) => {
  const res = await api.patch(`/api/admin/guides/${id}/unpublish`);
  return res.data;
};

export const adminArchiveGuide = async (id) => {
  const res = await api.patch(`/api/admin/guides/${id}/archive`);
  return res.data;
};

export const adminVerifyGuide = async (id) => {
  const res = await api.patch(`/api/admin/guides/${id}/verify`);
  return res.data;
};

export const adminDeleteGuide = async (id) => {
  const res = await api.delete(`/api/admin/guides/${id}`);
  return res.data;
};
