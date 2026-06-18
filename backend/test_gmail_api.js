import dotenv from 'dotenv';
dotenv.config();
import { sendVerificationEmail, sendPasswordResetEmail } from './utils/email.js';

const testAllEmails = async () => {
  const email = 'veerendrakumartmsl@gmail.com';
  console.log(`🚀 Sending two real test emails to: ${email}...`);

  try {
    // 1. Send Registration OTP Email
    console.log('\n--- Test 1: Registration OTP Email ---');
    const regRes = await sendVerificationEmail(email, '789123');
    console.log('✅ Registration OTP Email request complete.');
    console.log('Result:', JSON.stringify(regRes, null, 2));

    // 2. Send Password Reset OTP Email
    console.log('\n--- Test 2: Password Reset OTP Email ---');
    const resetRes = await sendPasswordResetEmail(email, '321987');
    console.log('✅ Password Reset OTP Email request complete.');
    console.log('Result:', JSON.stringify(resetRes, null, 2));

    console.log('\n🌟 Both emails have been sent successfully via Gmail API!');
    console.log('Please check your Inbox (veerendrakumartmsl@gmail.com) for the two emails!');
  } catch (err) {
    console.error('\n❌ Test Failed:');
    console.error(err);
  }
};

testAllEmails();
