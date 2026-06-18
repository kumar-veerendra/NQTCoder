import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const testNodemailer = async () => {
  const emailUser = process.env.EMAIL_USER;
  let emailPass = process.env.EMAIL_PASS;
  if (emailPass) {
    emailPass = emailPass.replace(/\s+/g, '');
  }

  console.log('EMAIL_USER:', emailUser);
  console.log('EMAIL_PASS (spaces removed):', emailPass ? 'PRESENT' : 'MISSING');

  if (!emailUser || !emailPass) {
    console.error('Error: EMAIL_USER or EMAIL_PASS is not defined in .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"NQTCoder Diagnostics" <${emailUser}>`,
      to: emailUser,
      subject: 'NQTCoder - Nodemailer Local Test Connection',
      html: '<h3>Nodemailer Connection Diagnostic</h3><p>If you see this email, the local Gmail SMTP transport is working perfectly!</p>'
    });

    console.log('\n✅ Nodemailer Sent Success:');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('\n❌ Nodemailer Call Failed:');
    console.error(err);
  }
};

testNodemailer();
