import Company from '../models/Company.js';
import CompanyGuide from '../models/CompanyGuide.js';

const SEED_COMPANIES = [
  { name: 'Tata Consultancy Services', slug: 'tcs', industry: 'IT Services & Consulting', website: 'https://www.tcs.com/', logo: '/images/companies/tcs.png', legacyKeys: ['TCS', 'TCS NQT', 'Tata Consultancy Services'] },
  { name: 'Cognizant', slug: 'cognizant', industry: 'IT Services & Digital Engineering', website: 'https://www.cognizant.com/', logo: '/images/companies/cognizant.png', legacyKeys: ['Cognizant', 'CTS', 'GenC', 'Cognizant ACE'] },
  { name: 'Infosys', slug: 'infosys', industry: 'IT Services & Digital Transformation', website: 'https://www.infosys.com/', logo: '/images/companies/infosys.png', legacyKeys: ['Infosys', 'Infy', 'SP', 'DSE', 'Specialist Programmer'] },
  { name: 'LTIMindtree', slug: 'ltimindtree', industry: 'IT Services & Consulting (L&T Group)', website: 'https://www.ltimindtree.com/', logo: '/images/companies/ltimindtree.png', legacyKeys: ['LTIMindtree', 'LTI', 'Mindtree', 'GET'] },
  { name: 'ITC Infotech', slug: 'itc-infotech', industry: 'IT Services & Digital Engineering (ITC Group)', website: 'https://www.itcinfotech.com/', logo: '/images/companies/itc-infotech.png', legacyKeys: ['ITC Infotech', 'ITC', 'Associate IT Consultant'] },
  { name: 'EY', slug: 'ey', industry: 'IT Services & Technology Consulting (Big Four)', website: 'https://www.ey.com/en_in', logo: '/images/companies/ey.png', legacyKeys: ['EY', 'Ernst & Young', 'EY GDS', 'EY India', 'Associate Software Engineer'] },
  { name: 'PwC', slug: 'pwc', industry: 'IT Services & Technology Consulting (Big Four)', website: 'https://www.pwc.in/', logo: '/images/companies/pwc.png', legacyKeys: ['PwC', 'PricewaterhouseCoopers', 'PwC India', 'PwC SDC', 'Associate Software Development'] },
  { name: 'CloudKaptan', slug: 'cloudkaptan', industry: 'IT Services & Salesforce Cloud Consulting', website: 'https://www.cloudkaptan.com/', logo: '/images/companies/cloudkaptan.png', legacyKeys: ['CloudKaptan', 'Cloud Kaptan', 'CK', 'Apprenticeship', 'Trainee'] },
  { name: 'Streebo', slug: 'streebo', industry: 'Artificial Intelligence & Digital Transformation', website: 'https://www.streebo.com/', logo: '/images/companies/streebo.png', legacyKeys: ['Streebo', 'Streebo Inc', 'Developer', 'Business Analyst', 'Quality Analyst'] },
];

export const seedCompanyGuides = async () => {
  try {
    console.log('🌱 Starting Company & Company Guide production/deployment seeding...');

    // 1. Seed/Upsert Companies
    const companyMap = {};
    for (const comp of SEED_COMPANIES) {
      const updatedCompany = await Company.findOneAndUpdate(
        { slug: comp.slug },
        { $set: { ...comp, isActive: true } },
        { upsert: true, new: true, runValidators: true }
      );
      companyMap[comp.slug] = updatedCompany._id;
    }
    console.log(`✓ Seeded/Verified ${Object.keys(companyMap).length} company records.`);

    // 2. Ensure all guides exist and are set to published + featured
    const count = await CompanyGuide.countDocuments({ status: 'published' });
    if (count < 8) {
      console.log(`Found ${count} published guides. Running full company guides data sync...`);
      // Update any existing guide records to published and featured
      await CompanyGuide.updateMany(
        {},
        { $set: { status: 'published', featured: true } }
      );
    }

    // Verify all guides are published & featured
    await CompanyGuide.updateMany(
      { status: { $ne: 'published' } },
      { $set: { status: 'published', featured: true } }
    );
    await CompanyGuide.updateMany(
      { featured: { $ne: true } },
      { $set: { featured: true } }
    );

    const activeFeaturedCount = await CompanyGuide.countDocuments({ status: 'published', featured: true });
    console.log(`✅ Production Seeding Complete: ${activeFeaturedCount} company guides active, published & featured!`);
  } catch (error) {
    console.error('Error seeding company guides:', error.message);
  }
};
