import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Question from '../models/Question.js';
import SyllabusTopic from '../models/SyllabusTopic.js';

const passageQuestions = [
  {
    kind: 'VerbalQuestion',
    domain: 'aptitude',
    section: 'verbal',
    topic: 'passage-recall',
    title: 'Emergency Ward Shift Handover',
    slug: 'emergency-ward-shift-handover',
    difficulty: 'medium',
    verbalType: 'passage_recall',
    passageText: 'At 11 PM on Sunday, Nurse Sarah delivered the emergency logs to City Hospital. She noted that Patient 304 required 50mg of IV Antibiotics after midnight. Dr. Sharma scheduled the follow-up assessment for 6 AM Monday.',
    keyFacts: ['11 PM', 'Sunday', 'Nurse Sarah', 'City Hospital', 'Patient 304', '50mg', 'IV Antibiotics', 'Dr. Sharma', '6 AM', 'Monday'],
    applicableCompanies: ['TCS', 'Infosys', 'Cognizant'],
    writingDurationSecEmail: 120,
    visibility: 'official',
    sourceType: 'seed'
  },
  {
    kind: 'VerbalQuestion',
    domain: 'aptitude',
    section: 'verbal',
    topic: 'passage-recall',
    title: 'Corporate Celebration Announcement',
    slug: 'corporate-celebration-announcement',
    difficulty: 'easy',
    verbalType: 'passage_recall',
    passageText: 'The annual team milestone celebration will take place at Grand Palace Hotel on December 15th starting at 7 PM. Employees are requested to submit their dietary choices to HR Manager Anita by Friday. A custom holiday cake will be served at 9 PM.',
    keyFacts: ['Grand Palace Hotel', 'December 15th', '7 PM', 'HR Manager Anita', 'Friday', 'holiday cake', '9 PM'],
    applicableCompanies: ['TCS', 'Capgemini'],
    writingDurationSecEmail: 120,
    visibility: 'official',
    sourceType: 'seed'
  },
  {
    kind: 'VerbalQuestion',
    domain: 'aptitude',
    section: 'verbal',
    topic: 'passage-recall',
    title: 'Server Maintenance Window Notice',
    slug: 'server-maintenance-window-notice',
    difficulty: 'hard',
    verbalType: 'passage_recall',
    passageText: 'Lead Engineer Vikram announced scheduled database patching for Server DB-09 on Saturday at 2 AM. Downtime is expected to last 45 minutes. System Admin Rahul will verify full data replication before traffic is restored at 3 AM.',
    keyFacts: ['Lead Engineer Vikram', 'DB-09', 'Saturday', '2 AM', '45 minutes', 'System Admin Rahul', '3 AM'],
    applicableCompanies: ['TCS', 'Infosys', 'Wipro'],
    writingDurationSecEmail: 120,
    visibility: 'official',
    sourceType: 'seed'
  }
];

const seedPassageRecall = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Checking Passage Recall questions...');

    // Update any existing questions in topic passage-recall to domain 'aptitude'
    await Question.updateMany(
      { topic: 'passage-recall' },
      { $set: { domain: 'aptitude' } }
    );
    console.log('Updated existing passage-recall questions to domain: aptitude');

    let insertedCount = 0;
    const maxQ = await Question.findOne().sort({ questionNo: -1 });
    let nextQNo = (maxQ && maxQ.questionNo) ? maxQ.questionNo + 1 : 9000;

    for (const item of passageQuestions) {
      const exists = await Question.findOne({ title: item.title, topic: 'passage-recall' });
      if (!exists) {
        await Question.create({
          ...item,
          questionNo: nextQNo++
        });
        insertedCount++;
        console.log(`Inserted Passage Recall question #${nextQNo - 1}: "${item.title}"`);
      } else {
        console.log(`Question already exists: "${item.title}"`);
      }
    }

    const totalCount = await Question.countDocuments({ topic: 'passage-recall' });
    await SyllabusTopic.updateOne(
      { topic: 'passage-recall' },
      { $set: { questionCount: totalCount } }
    );
    console.log(`Updated SyllabusTopic 'passage-recall' questionCount to ${totalCount}.`);

    console.log(`Successfully seeded ${insertedCount} new Passage Recall questions!`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed passage recall questions:', err);
    process.exit(1);
  }
};

seedPassageRecall();
