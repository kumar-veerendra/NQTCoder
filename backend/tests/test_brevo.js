import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const testBrevo = async () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER || 'veerendrakumartmsl@gmail.com';
  const recipient = senderEmail;

  console.log('API Key:', apiKey ? 'PRESENT' : 'MISSING');
  console.log('Sender Email:', senderEmail);
  console.log('Sending diagnostic email to:', recipient);

  if (!apiKey) {
    console.error('Error: BREVO_API_KEY is not defined in .env');
    return;
  }

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: "NQTCoder Diagnostics",
        email: senderEmail
      },
      to: [
        {
          email: recipient
        }
      ],
      subject: 'NQTCoder - Brevo Mail Test Connection',
      htmlContent: '<h3>Connection Diagnostic</h3><p>If you see this email, the Brevo API and sender config are working perfectly!</p>'
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      }
    });

    console.log('\n✅ Brevo API Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\nEmail sent successfully via Brevo API.');
  } catch (err) {
    console.error('\n❌ Brevo API Call Failed:');
    if (err.response) {
      console.error('Status Code:', err.response.status);
      console.error('Error Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
    }
  }
};

testBrevo();
