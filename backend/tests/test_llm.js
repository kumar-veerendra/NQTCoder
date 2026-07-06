import dotenv from 'dotenv';
dotenv.config();
import { evaluatePassageRecall, evaluateEmailWriting } from '../services/llmEvaluationService.js';

const runTest = async () => {
  console.log('--- Testing Passage Recall LLM Evaluation ---');
  const passageText = "The solar system consists of the Sun and the objects that orbit it. This includes the eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.";
  const studentAnswer = "The solar system is made of the Sun and planets orbiting it like Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.";
  
  const result = await evaluatePassageRecall(passageText, studentAnswer);
  console.log('Passage Recall Result:', JSON.stringify(result, null, 2));

  console.log('\n--- Testing Email Writing LLM Evaluation ---');
  const emailPrompt = "Write an email to request a sick leave from your manager.";
  const guidelines = ["Subject requesting leave", "Dates of absence", "Handover details"];
  const emailAnswer = "Subject: Urgent: Request for sick leave\n\nDear Manager,\nI am writing to request a sick leave for today and tomorrow due to a severe migraine. I have shared my tasks with John. Regards, Alex.";

  const emailResult = await evaluateEmailWriting(emailPrompt, guidelines, emailAnswer);
  console.log('Email Writing Result:', JSON.stringify(emailResult, null, 2));
};

runTest().catch(console.error);
