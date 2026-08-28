const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOrderConfirmationEmail({
  customerEmail,
  orderId,
  paymentIntentId,
  totalAmountCents,
}) {
  if (!customerEmail) return;

  const totalFormatted = (totalAmountCents / 100).toFixed(2);
  const siteUrl =
    process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://pegty.com";

  const mailOptions = {
    from:
      process.env.FROM_EMAIL ||
      `"Pegty Marketplace" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation #${orderId} - Your Pegty Verified Buyer Details`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #0f172a;">
        <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Thank You for Your Order!</h1>
          <p style="color: #c7d2fe; margin-top: 8px; font-size: 14px;">Your digital assets are ready for download.</p>
        </div>

        <div style="padding: 28px 24px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <span style="font-size: 13px; color: #64748b; font-weight: 600;">Order ID</span>
              <span style="font-size: 14px; color: #0f172a; font-weight: 700;">#${orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <span style="font-size: 13px; color: #64748b; font-weight: 600;">Payment Reference</span>
              <span style="font-size: 13px; color: #0f172a; font-family: monospace;">${paymentIntentId}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 13px; color: #64748b; font-weight: 600;">Total Paid</span>
              <span style="font-size: 16px; color: #4f46e5; font-weight: 800;">$${totalFormatted} USD</span>
            </div>
          </div>

          <div style="background-color: #eef2ff; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4338ca; letter-spacing: 0.5px;">
              Verified Buyer Verification Credentials
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #3730a3;">
              Use your Order ID along with your email address (<strong>${customerEmail}</strong>) when leaving product ratings or reviews:
            </p>
            <div style="background-color: #ffffff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e1b4b; display: inline-block;">
              Order ID: #${orderId}
            </div>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${siteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Return to Pegty Marketplace
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">
          © ${new Date().getFullYear()} Pegty. All rights reserved.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmationEmail };
