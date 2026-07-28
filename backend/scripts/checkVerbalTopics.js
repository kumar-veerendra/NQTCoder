import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Question from '../models/Question.js';

const checkTopics = async () => {
  try {
    await connectDB();
    const verbalTopics = await Question.find({ section: 'verbal' }).distinct('topic');
    console.log('Distinct verbal topics in Question collection:', verbalTopics);

    const passageRecallDash = await Question.countDocuments({ topic: 'passage-recall' });
    const passageRecallUnder = await Question.countDocuments({ topic: 'passage_recall' });
    const emailWritingDash = await Question.countDocuments({ topic: 'email-writing' });
    const emailWritingUnder = await Question.countDocuments({ topic: 'email_writing' });

    console.log(`topic 'passage-recall': ${passageRecallDash}`);
    console.log(`topic 'passage_recall': ${passageRecallUnder}`);
    console.log(`topic 'email-writing': ${emailWritingDash}`);
    console.log(`topic 'email_writing': ${emailWritingUnder}`);

    const samples = await Question.find({ verbalType: 'passage_recall' }).limit(3);
    console.log('Passage recall questions topics:', samples.map(s => ({ title: s.title, topic: s.topic, verbalType: s.verbalType })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTopics();
