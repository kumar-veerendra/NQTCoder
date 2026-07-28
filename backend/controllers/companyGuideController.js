import Company from '../models/Company.js';
import CompanyGuide from '../models/CompanyGuide.js';

const computeHighlights = (guide) => {
  const h = [];
  if (guide.examPattern && guide.examPattern.length > 0) h.push('Exam Pattern');
  if (guide.roles && guide.roles.length > 0) h.push('Roles & Packages');
  if (guide.eligibility && (guide.eligibility.minimumPercentage || (guide.eligibility.eligibleDegrees && guide.eligibility.eligibleDegrees.length > 0))) h.push('Eligibility');
  if (guide.content && guide.content.trim().length > 0) h.push('Full Syllabus');
  if (guide.faqs && guide.faqs.length > 0) h.push('FAQs');
  return h;
};

export const getCompanies = async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600');
    const companies = await Company.find({ isActive: true })
      .select('name slug logo shortDescription legacyKeys')
      .sort({ name: 1 }).lean();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGuides = async (req, res) => {
  try {
    const filter = { status: 'published' };
    if (req.query.company) filter.company = req.query.company;
    if (req.query.type) filter.guideType = req.query.type;
    const guides = await CompanyGuide.find(filter)
      .select('-content -__v -createdBy -updatedBy -schemaVersion -previousSlugs')
      .populate('company', 'name slug logo legacyKeys')
      .sort({ featured: -1, updatedAt: -1 }).lean();
    let result = guides;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      result = guides.filter(g => re.test(g.title) || re.test(g.examName) || re.test(g.shortDescription));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedGuides = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const guides = await CompanyGuide.find({ status: 'published', featured: true })
      .select('title slug examName shortDescription lastVerifiedAt featured company roles eligibility examPattern content faqs')
      .populate('company', 'name slug logo legacyKeys')
      .sort({ updatedAt: -1 }).limit(8).lean();
    const cards = guides.map(g => ({
      _id: g._id, title: g.title, slug: g.slug, examName: g.examName,
      shortDescription: g.shortDescription, lastVerifiedAt: g.lastVerifiedAt,
      featured: g.featured, company: g.company, highlights: computeHighlights(g),
    }));
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGuideSlugs = async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600');
    const guides = await CompanyGuide.find({ status: 'published' }).select('slug updatedAt').lean();
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGuideBySlug = async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=600');
    const guide = await CompanyGuide.findOne({ slug: req.params.slug.toLowerCase(), status: 'published' })
      .select('-__v -createdBy -updatedBy -schemaVersion -previousSlugs')
      .populate('company', 'name slug logo website shortDescription legacyKeys').lean();
    if (!guide) return res.status(404).json({ message: 'Guide not found or not published.' });
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
