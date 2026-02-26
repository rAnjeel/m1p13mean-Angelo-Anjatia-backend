const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWelcomeEmail = async (toEmail, fullName) => {
  const info = await transporter.sendMail({
    from: `"Vendeo - Centre Commercial" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Welcome to Vendeo Platform 🎉",
    html: `
      <h2>Hello ${fullName},</h2>
      <p>Your account has been created successfully.</p>
      <p>We are happy to have you on our platform.</p>
      <br/>
      <small>Mall Team</small>
    `,
  });

  console.log("Email sent:", info.messageId);
};

module.exports = {
  sendWelcomeEmail,
};