import axios from 'axios';
import { Resend } from 'resend';

// ─── Gmail API (Primary — sends to any email, no domain needed) ───────────────
let cachedAccessToken = null;
let tokenExpiryTime = 0;

const getGmailAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedAccessToken;
  }
  const { GOOGLE_GMAIL_CLIENT_ID: clientId, GOOGLE_GMAIL_CLIENT_SECRET: clientSecret, GOOGLE_GMAIL_REFRESH_TOKEN: refreshToken } = process.env;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Gmail API credentials missing.');

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: clientId, client_secret: clientSecret,
    refresh_token: refreshToken, grant_type: 'refresh_token',
  });

  cachedAccessToken = response.data.access_token;
  tokenExpiryTime   = Date.now() + response.data.expires_in * 1000;
  return cachedAccessToken;
};

const sendViaGmailAPI = async (to, subject, html) => {
  const senderEmail = process.env.EMAIL_USER || 'veerendrakumartmsl@gmail.com';
  const accessToken = await getGmailAccessToken();
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const message = [
    `From: NQTCoder <${senderEmail}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '', html,
  ].join('\n');
  const raw = Buffer.from(message).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const res = await axios.post(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    { raw },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );
  return res.data;
};

// ─── Resend (Fallback — requires verified domain for sending to any email) ─────
const sendViaResend = async (to, subject, html) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: 'NQTCoder <onboarding@resend.dev>',
    to, subject, html,
  });
  if (error) throw new Error(error.message);
  return data;
};

// ─── Brevo (Fallback — requires verified domain for sending to any email) ──────
const sendViaBrevo = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@nqtcoder.dev';
  const senderName = process.env.BREVO_SENDER_NAME || 'NQTCoder';
  
  if (!apiKey) throw new Error('Brevo API key missing.');

  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    },
    {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// ─── OTP HTML template ────────────────────────────────────────────────────────
const otpTemplate = (code, bodyText) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #1e293b;border-radius:16px;background-color:#0b1329;color:#f1f5f9;">
    <div style="text-align:center;margin-bottom:25px;">
      <h2 style="color:#6366f1;margin:0;font-size:26px;font-weight:800;">NQTCoder</h2>
      <p style="font-size:13px;color:#94a3b8;margin:6px 0 0 0;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;">Placement Preparation Arena</p>
    </div>
    <div style="border-top:1px solid #1e293b;margin-bottom:25px;"></div>
    <p style="font-size:15px;line-height:1.6;color:#cbd5e1;font-weight:500;">Hello,</p>
    <p style="font-size:15px;line-height:1.6;color:#cbd5e1;font-weight:500;">${bodyText}</p>
    <div style="text-align:center;margin:35px 0;">
      <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:800;letter-spacing:12px;color:#ffffff;background-color:#0f172a;padding:16px 36px;border-radius:14px;border:2px solid #6366f1;display:inline-block;box-shadow:0 4px 24px rgba(99,102,241,0.30);">${code}</span>
    </div>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
      This OTP is valid for <strong style="color:#f1f5f9;">10 minutes</strong>.
      If you did not request this, please ignore this email.
    </p>
    <div style="border-top:1px solid #1e293b;margin-top:35px;margin-bottom:20px;"></div>
    <p style="font-size:11px;color:#64748b;text-align:center;margin:0;">&copy; 2026 NQTCoder. All rights reserved.</p>
  </div>
`;

// ─── Master send: Gmail API → Brevo → Resend fallback ─────────────────────────
const sendEmail = async (to, subject, html) => {
  // 1️⃣  Try Gmail API first (works for all recipients, no domain needed)
  if (process.env.GOOGLE_GMAIL_CLIENT_ID) {
    try {
      const result = await sendViaGmailAPI(to, subject, html);
      console.log(`[EMAIL] ✅ Sent via Gmail API to ${to}`);
      return result;
    } catch (gmailErr) {
      console.warn('[EMAIL] Gmail API failed, trying fallbacks:', gmailErr.response?.data?.error || gmailErr.message);
    }
  }

  // 2️⃣  Try Brevo API (requires verified domain or sender)
  if (process.env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevo(to, subject, html);
      console.log(`[EMAIL] ✅ Sent via Brevo to ${to}`);
      return result;
    } catch (brevoErr) {
      console.warn('[EMAIL] Brevo failed, trying Resend fallback:', brevoErr.response?.data || brevoErr.message);
    }
  }

  // 3️⃣  Resend fallback (requires verified domain for non-owner recipients)
  if (process.env.RESEND_API_KEY) {
    try {
      const result = await sendViaResend(to, subject, html);
      console.log(`[EMAIL] ✅ Sent via Resend to ${to}`);
      return result;
    } catch (resendErr) {
      console.error('[EMAIL] Resend also failed:', resendErr.message);
      throw resendErr;
    }
  }

  console.warn('[EMAIL] ⚠️ No email provider configured.');
  return { mock: true };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send 6-digit OTP verification email
 */
export const sendVerificationEmail = async (email, code) => {
  console.log(`\n[EMAIL] Sending verification OTP ${code} → ${email}`);
  return sendEmail(
    email,
    'NQTCoder — Verify Your Email',
    otpTemplate(code, 'Thank you for registering on NQTCoder! To activate your account and start practicing placement coding challenges, enter the OTP below:')
  );
};

/**
 * Send 6-digit OTP password-reset email
 */
export const sendPasswordResetEmail = async (email, code) => {
  console.log(`\n[EMAIL] Sending password-reset OTP ${code} → ${email}`);
  return sendEmail(
    email,
    'NQTCoder — Password Reset Request',
    otpTemplate(code, 'We received a request to reset the password for your NQTCoder account. Use the OTP below to complete the process:')
  );
};
