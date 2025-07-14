import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // ✅ Load env variables

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,   // ✅ From .env
    pass: process.env.EMAIL_PASS    // ✅ From .env
  }
});

export default async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"South Mirrors News" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}
