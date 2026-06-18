import axios from 'axios';

let cachedAccessToken = null;
let tokenExpiryTime = 0;

/**
 * Get access token from Google OAuth
 */
const getGmailAccessToken = async () => {
  // If token is cached and not expired (with 1 min buffer), return it
  if (cachedAccessToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedAccessToken;
  }

  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail API credentials missing in environment.');
  }

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  cachedAccessToken = response.data.access_token;
  tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
  return cachedAccessToken;
};

/**
 * Send email via Google Gmail API (HTTPS)
 */
const sendEmailViaGmailAPI = async (to, subject, htmlContent) => {
  const senderEmail = process.env.EMAIL_USER || 'veerendrakumartmsl@gmail.com';
  const accessToken = await getGmailAccessToken();

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: NQTCoder <${senderEmail}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent
  ];
  const message = messageParts.join('\n');

  // Base64URL encode the message
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await axios.post(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    { raw: encodedMessage },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

/**
 * Send 6-digit OTP verification email to registered user
 * @param {string} email 
 * @param {string} code 
 */
export const sendVerificationEmail = async (email, code) => {
  console.log(`\n========================================`);
  console.log(`[EMAIL] Registration OTP sent to: ${email}`);
  console.log(`[EMAIL] Code: ${code}`);
  console.log(`========================================\n`);

  const htmlContent = `
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
  `;

  if (process.env.GOOGLE_GMAIL_CLIENT_ID) {
    try {
      console.log("Sending email via Gmail API...");
      return await sendEmailViaGmailAPI(email, 'NQTCoder - Verify Your Email', htmlContent);
    } catch (apiErr) {
      console.error("Gmail API Send Error:", apiErr.response ? apiErr.response.data : apiErr.message);
      throw apiErr;
    }
  }

  console.log("Gmail API not configured. Falling back to console log only.");
  return { mock: true, code };
};

/**
 * Send 6-digit OTP password reset email to user
 * @param {string} email 
 * @param {string} code 
 */
export const sendPasswordResetEmail = async (email, code) => {
  console.log(`\n========================================`);
  console.log(`[EMAIL] Password Reset OTP sent to: ${email}`);
  console.log(`[EMAIL] Code: ${code}`);
  console.log(`========================================\n`);

  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b1329; color: #f1f5f9; text-align: left;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">NQTCoder</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 5px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Placement Preparation Arena</p>
        </div>
        <div style="border-top: 1px solid #1e293b; margin-bottom: 25px;"></div>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; font-weight: 500;">Hello,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; font-weight: 500;">We received a request to reset the password for your NQTCoder account. Please use the following 6-digit One-Time Password (OTP) to complete the reset process:</p>
        <div style="text-align: center; margin: 35px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; background-color: #0f172a; padding: 15px 35px; border-radius: 12px; border: 1px solid #38bdf8; display: inline-block; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);">${code}</span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        <div style="border-top: 1px solid #1e293b; margin-top: 35px; margin-bottom: 20px;"></div>
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0; font-weight: 500;">&copy; 2026 NQTCoder. All rights reserved.</p>
      </div>
  `;

  if (process.env.GOOGLE_GMAIL_CLIENT_ID) {
    try {
      console.log("Sending email via Gmail API...");
      return await sendEmailViaGmailAPI(email, 'NQTCoder - Password Reset Request', htmlContent);
    } catch (apiErr) {
      console.error("Gmail API Send Error:", apiErr.response ? apiErr.response.data : apiErr.message);
      throw apiErr;
    }
  }

  console.log("Gmail API not configured. Falling back to console log only.");
  return { mock: true, code };
};
