const nodemailer = require('nodemailer');

type SendMailInput = {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  service: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,  
  },
});

export async function sendEmail(input: SendMailInput) {
  const info = await transporter.sendMail({
    from: input.from ?? process.env.EMAIL_USER,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return info;
}

export default transporter;
