import Company from '../models/Company.js';
import CompanyGuide from '../models/CompanyGuide.js';
import { sanitizeHtml } from '../utils/sanitizeHtml.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const generateSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// ── Company admin endpoints ───────────────────────────────────────────────────

export const adminGetCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 }).lean();
    res.json(companies);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminCreateCompany = async (req, res) => {
  const { name, slug, logo, website, shortDescription, legacyKeys, isActive } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Company name is required.' });
  const finalSlug = slug ? generateSlug(slug) : generateSlug(name);
  if (!SLUG_REGEX.test(finalSlug)) return res.status(400).json({ message: 'Invalid slug format.' });
  try {
    const exists = await Company.findOne({ $or: [{ name: name.trim() }, { slug: finalSlug }] });
    if (exists) return res.status(400).json({ message: 'A company with this name or slug already exists.' });
    const company = await Company.create({
      name: name.trim(), slug: finalSlug, logo: logo || '', website: website || '',
      shortDescription: shortDescription || '',
      legacyKeys: Array.isArray(legacyKeys) ? legacyKeys : [],
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(company);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminUpdateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    const { name, slug, logo, website, shortDescription, legacyKeys, isActive } = req.body;
    if (name !== undefined) company.name = name.trim();
    if (logo !== undefined) company.logo = logo;
    if (website !== undefined) company.website = website;
    if (shortDescription !== undefined) company.shortDescription = shortDescription;
    if (legacyKeys !== undefined) company.legacyKeys = Array.isArray(legacyKeys) ? legacyKeys : [];
    if (isActive !== undefined) company.isActive = isActive;
    if (slug !== undefined) {
      const newSlug = generateSlug(slug);
      if (!SLUG_REGEX.test(newSlug)) return res.status(400).json({ message: 'Invalid slug format.' });
      const conflict = await Company.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (conflict) return res.status(400).json({ message: 'Slug already used.' });
      company.slug = newSlug;
    }
    res.json(await company.save());
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── Guide admin endpoints ─────────────────────────────────────────────────────

export const adminGetGuides = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && ['draft', 'published', 'archived'].includes(req.query.status)) filter.status = req.query.status;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const total = await CompanyGuide.countDocuments(filter);
    let guides = await CompanyGuide.find(filter)
      .select('title slug status featured guideType examName publishedAt updatedAt lastVerifiedAt company')
      .populate('company', 'name slug logo')
      .sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      guides = guides.filter(g => re.test(g.title) || re.test(g.examName) || re.test(g.company && g.company.name));
    }
    res.json({ guides, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminGetGuideById = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id)
      .populate('company', 'name slug logo legacyKeys').lean();
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    res.json(guide);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminCreateGuide = async (req, res) => {
  const { company, title, slug, examName, shortDescription, guideType } = req.body;
  if (!company) return res.status(400).json({ message: 'Company is required.' });
  if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required.' });
  const finalSlug = slug ? generateSlug(slug) : generateSlug(title);
  if (!SLUG_REGEX.test(finalSlug)) return res.status(400).json({ message: 'Invalid slug format.' });
  try {
    if (!await Company.findById(company)) return res.status(400).json({ message: 'Company not found.' });
    if (await CompanyGuide.findOne({ slug: finalSlug })) return res.status(400).json({ message: 'Slug already in use.' });
    const guide = await CompanyGuide.create({
      company, title: title.trim(), slug: finalSlug,
      examName: examName || '', shortDescription: shortDescription || '',
      guideType: guideType || 'placement_exam', status: 'draft',
      createdBy: req.user._id, updatedBy: req.user._id,
    });
    res.status(201).json(guide);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminUpdateGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    const {
      company, title, slug, examName, shortDescription, guideType, coverImage,
      roles, eligibility, recruitmentStages, examPattern, faqs, resources, sources, seo,
      content, dataNotice, featured
    } = req.body;
    if (company !== undefined) {
      if (!await Company.findById(company)) return res.status(400).json({ message: 'Company not found.' });
      guide.company = company;
    }
    if (title !== undefined) guide.title = title.trim();
    if (examName !== undefined) guide.examName = examName;
    if (shortDescription !== undefined) guide.shortDescription = shortDescription;
    if (guideType !== undefined) guide.guideType = guideType;
    if (coverImage !== undefined) guide.coverImage = coverImage;
    if (dataNotice !== undefined) guide.dataNotice = dataNotice;
    if (featured !== undefined) guide.featured = featured;
    if (slug !== undefined) {
      const newSlug = generateSlug(slug);
      if (!SLUG_REGEX.test(newSlug)) return res.status(400).json({ message: 'Invalid slug format.' });
      if (newSlug !== guide.slug) {
        const conflict = await CompanyGuide.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
        if (conflict) return res.status(400).json({ message: 'Slug already in use.' });
        if (!guide.previousSlugs.includes(guide.slug)) guide.previousSlugs.push(guide.slug);
        guide.slug = newSlug;
      }
    }
    if (content !== undefined) guide.content = sanitizeHtml(content);
    if (roles !== undefined) guide.roles = roles;
    if (eligibility !== undefined) guide.eligibility = eligibility;
    if (recruitmentStages !== undefined) guide.recruitmentStages = recruitmentStages;
    if (examPattern !== undefined) guide.examPattern = examPattern;
    if (faqs !== undefined) guide.faqs = faqs;
    if (resources !== undefined) guide.resources = resources;
    if (sources !== undefined) guide.sources = sources;
    if (seo !== undefined) guide.seo = seo;
    guide.updatedBy = req.user._id;
    res.json(await guide.save());
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminPublishGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    if (!guide.company) return res.status(400).json({ message: 'Publish gate: Company is required.' });
    if (!guide.title || !guide.title.trim()) return res.status(400).json({ message: 'Publish gate: Title is required.' });
    if (!guide.slug) return res.status(400).json({ message: 'Publish gate: Slug is required.' });
    if (!guide.shortDescription || !guide.shortDescription.trim()) return res.status(400).json({ message: 'Publish gate: Short description is required.' });
    const hasContent = (guide.content && guide.content.trim().length > 50) || guide.examPattern.length > 0 || guide.roles.length > 0;
    if (!hasContent) return res.status(400).json({ message: 'Publish gate: Add exam pattern, roles, or guide content before publishing.' });
    guide.status = 'published';
    if (!guide.publishedAt) guide.publishedAt = new Date();
    guide.archivedAt = undefined;
    guide.updatedBy = req.user._id;
    await guide.save();
    res.json({ message: 'Guide published successfully.', guide });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminUnpublishGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    guide.status = 'draft';
    guide.updatedBy = req.user._id;
    await guide.save();
    res.json({ message: 'Guide moved back to draft.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminArchiveGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    guide.status = 'archived';
    guide.archivedAt = new Date();
    guide.updatedBy = req.user._id;
    await guide.save();
    res.json({ message: 'Guide archived.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminVerifyGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    guide.lastVerifiedAt = new Date();
    guide.updatedBy = req.user._id;
    await guide.save();
    res.json({ message: 'Guide marked as verified.', lastVerifiedAt: guide.lastVerifiedAt });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminDeleteGuide = async (req, res) => {
  try {
    const guide = await CompanyGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found.' });
    if (guide.status !== 'draft') return res.status(400).json({ message: 'Archive this guide instead of deleting — it may already be indexed by search engines.' });
    await guide.deleteOne();
    res.json({ message: 'Draft guide deleted.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
