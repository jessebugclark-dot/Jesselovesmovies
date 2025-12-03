// Quick email test script
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log('SMTP Config:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- Pass:', process.env.SMTP_PASSWORD ? '***hidden***' : '❌ NOT SET');
  console.log();

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: '✅ Film Festival Email Test',
      text: 'Success! Your email configuration is working correctly.',
      html: '<h2>✅ Success!</h2><p>Your email configuration is working correctly.</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.SMTP_USER);
  } catch (error) {
    console.error('❌ Email failed to send:');
    console.error(error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Tip: Make sure you generated an App Password (not your regular Gmail password)');
      console.log('   Go to: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail();


