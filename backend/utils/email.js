import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send 6-digit OTP verification email to registered user
 * @param {string} email 
 * @param {string} code 
 */
export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"NQTCoder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'NQTCoder - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b1329; color: #f1f5f9; text-align: left;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">NQTCoder</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 5px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Placement Preparation Arena</p>
        </div>
        <div style="border-top: 1px solid #1e293b; margin-bottom: 25px;"></div>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; font-weight: 500;">Hello,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; font-weight: 500;">Thank you for registering on NQTCoder. To activate your account and start practicing coding challenges, please enter the following 6-digit One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 35px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; background-color: #0f172a; padding: 15px 35px; border-radius: 12px; border: 1px solid #38bdf8; display: inline-block; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);">${code}</span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">This code is valid for <strong>10 minutes</strong>. If you did not request registration on NQTCoder, please disregard this email.</p>
        <div style="border-top: 1px solid #1e293b; margin-top: 35px; margin-bottom: 20px;"></div>
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0; font-weight: 500;">&copy; 2026 NQTCoder. All rights reserved.</p>
      </div>
    `
  };

  return getTransporter().sendMail(mailOptions);
};
