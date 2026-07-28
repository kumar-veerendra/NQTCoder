import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminGetGuides, adminGetCompanies, adminCreateCompany, adminCreateGuide,
  adminPublishGuide, adminUnpublishGuide, adminArchiveGuide, adminVerifyGuide, adminDeleteGuide
} from '../services/companyGuideService';
import { Plus, Search, Eye, Edit3, CheckCircle, FileText, Archive, Trash2, Globe, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

const STATUS_BADGES = {
  draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-slate-800 text-slate-400 border-slate-700',
};

const AdminCompanyGuides = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New guide modal
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [newGuide, setNewGuide] = useState({ company: '', title: '', examName: '', shortDescription: '' });

  // New company modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', website: '', legacyKeys: '' });

  const [error, setError] = useState('');

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const [gData, cData] = await Promise.all([
        adminGetGuides({ status: statusFilter, search, page, limit: 20 }),
        adminGetCompanies(),
      ]);
      setGuides(gData.guides || []);
      setTotalPages(gData.totalPages || 1);
      setCompanies(cData || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [statusFilter, search, page]);

  const handleCreateGuide = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const created = await adminCreateGuide(newGuide);
      setShowGuideModal(false);
      navigate(`/admin/company-guides/${created._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create guide.');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const keysArray = newCompany.legacyKeys.split(',').map(k => k.trim()).filter(Boolean);
      await adminCreateCompany({ ...newCompany, legacyKeys: keysArray });
      setShowCompanyModal(false);
      setNewCompany({ name: '', website: '', legacyKeys: '' });
      fetchGuides();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company.');
    }
  };

  const handleAction = async (action, id) => {
    try {
      setError('');
      if (action === 'publish') await adminPublishGuide(id);
      if (action === 'unpublish') await adminUnpublishGuide(id);
      if (action === 'archive') await adminArchiveGuide(id);
      if (action === 'verify') await adminVerifyGuide(id);
      if (action === 'delete') {
        if (window.confirm('Delete this draft guide?')) {
          await adminDeleteGuide(id);
        }
      }
      fetchGuides();
    } catch (err) {
      setError(err.response?.data?.message || `Action failed.`);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Manage Company Guides | Admin" path="/admin/company-guides" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Company Guides CMS</h1>
            <p className="text-slate-400 text-xs mt-1">Manage company profiles, exam patterns, packages and syllabus guides.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCompanyModal(true)}
              className="px-4 py-2 bg-darkCard border border-darkBorder hover:border-slate-500 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              + Add Company
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-accentBlue hover:bg-accentBlue/90 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Guide</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-darkCard border border-darkBorder p-4 rounded-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides by title, company or exam..."
              className="w-full bg-darkBg border border-darkBorder rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-accentBlue"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accentBlue"
          >
            <option value="">All Statuses</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-darkBg/60 uppercase font-black text-[10px] tracking-wider text-slate-500 border-b border-darkBorder">
                <tr>
                  <th className="px-6 py-3">Guide Title</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Verified</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading guides...</td>
                  </tr>
                ) : guides.length > 0 ? (
                  guides.map((g) => (
                    <tr key={g._id} className="hover:bg-darkBg/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{g.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">/companies/{g.slug}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-300">
                        {g.company?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGES[g.status]}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {g.lastVerifiedAt ? (
                          <span className="text-emerald-400 text-[10px] flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{new Date(g.lastVerifiedAt).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleAction('verify', g._id)}
                            title="Mark verified today"
                            className="p-1.5 hover:text-emerald-400 text-slate-500 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {g.status === 'published' ? (
                            <Link to={`/companies/${g.slug}`} target="_blank" title="View Public Page" className="p-1.5 hover:text-sky-400 text-slate-500">
                              <Globe className="w-4 h-4" />
                            </Link>
                          ) : (
                            <Link to={`/admin/company-guides/${g._id}/preview`} target="_blank" title="Preview Draft" className="p-1.5 hover:text-sky-400 text-slate-500">
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}

                          <Link to={`/admin/company-guides/${g._id}/edit`} title="Edit Guide" className="p-1.5 hover:text-accentBlue text-slate-500">
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {g.status === 'draft' && (
                            <button onClick={() => handleAction('publish', g._id)} title="Publish" className="p-1.5 hover:text-emerald-400 text-slate-500">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </button>
                          )}

                          {g.status === 'published' && (
                            <button onClick={() => handleAction('unpublish', g._id)} title="Unpublish (to draft)" className="p-1.5 hover:text-amber-400 text-slate-500">
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          {g.status !== 'archived' ? (
                            <button onClick={() => handleAction('archive', g._id)} title="Archive" className="p-1.5 hover:text-slate-300 text-slate-500">
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : null}

                          {g.status === 'draft' && (
                            <button onClick={() => handleAction('delete', g._id)} title="Delete Draft" className="p-1.5 hover:text-rose-500 text-slate-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No company guides created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-darkCard border border-darkBorder w-full max-w-lg p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Company Guide</h3>
            <form onSubmit={handleCreateGuide} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company *</label>
                <select
                  required
                  value={newGuide.company}
                  onChange={(e) => setNewGuide({ ...newGuide, company: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Select Company...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Guide Title *</label>
                <input
                  type="text"
                  required
                  value={newGuide.title}
                  onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                  placeholder="e.g. TCS NQT 2026 Complete Guide"
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={newGuide.examName}
                  onChange={(e) => setNewGuide({ ...newGuide, examName: e.target.value })}
                  placeholder="e.g. TCS NQT"
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newGuide.shortDescription}
                  onChange={(e) => setNewGuide({ ...newGuide, shortDescription: e.target.value })}
                  placeholder="Concise overview..."
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accentBlue hover:bg-accentBlue/90 text-white rounded-lg text-xs font-bold"
                >
                  Create & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-darkCard border border-darkBorder w-full max-w-md p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Website</label>
                <input
                  type="url"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  placeholder="https://tcs.com"
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Legacy Filter Keys (comma separated)</label>
                <input
                  type="text"
                  value={newCompany.legacyKeys}
                  onChange={(e) => setNewCompany({ ...newCompany, legacyKeys: e.target.value })}
                  placeholder="e.g. TCS, tcs, Tata Consultancy"
                  className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-600 mt-1">Used to link practice questions via ?company= query param.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accentBlue hover:bg-accentBlue/90 text-white rounded-lg text-xs font-bold"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyGuides;
