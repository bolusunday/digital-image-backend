const nodemailer = require("nodemailer");

// Default specifically to Hostinger Webmail specifications (Port 465 SSL)
const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const isSecure = smtpPort === 465 || process.env.SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER ? process.env.SMTP_USER.trim() : "",
    pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : "",
  },
  connectionTimeout: 10000, // Prevent hanging connections on shared hosting
});

async function sendOrderConfirmationEmail({
  customerEmail,
  orderId,
  paymentIntentId,
  totalAmountCents,
}) {
  if (!customerEmail) {
    console.error(
      "❌ Order email skipped: customerEmail is undefined or empty.",
    );
    return;
  }

  const cleanCustomerEmail = customerEmail.trim();
  const cleanSmtpUser = process.env.SMTP_USER
    ? process.env.SMTP_USER.trim()
    : "";
  const totalFormatted = (totalAmountCents / 100).toFixed(2);
  const siteUrl =
    process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://pegty.com";

  // Extracts pure email address if process.env.FROM_EMAIL contains brackets or names
  const rawFromEmail = process.env.FROM_EMAIL || cleanSmtpUser;
  const cleanFromAddress = rawFromEmail.includes("<")
    ? rawFromEmail.match(/<([^>]+)>/)?.[1] || cleanSmtpUser
    : rawFromEmail.trim();

  const mailOptions = {
    // Passing object syntax ensures RFC 5322 compliance and forces "Pegty" in inbox list views
    from: {
      name: process.env.FROM_NAME || "Pegty",
      address: cleanSmtpUsers,
    },
    to: cleanCustomerEmail,
    subject: `Order Confirmation #${orderId} - Your Pegty Verified Buyer Details`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #0f172a;">
        
        <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Thank You for Your Purchase</h1>
          <p style="color: #c7d2fe; margin-top: 8px; font-size: 14px;">Your digital asset is ready for download.</p>
        </div>

        <div style="padding: 28px 24px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <tr>
                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Order ID</td>
                <td align="right" style="font-size: 14px; color: #0f172a; font-weight: 700;">#${orderId}</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <tr>
                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Payment Reference</td>
                <td align="right" style="font-size: 13px; color: #0f172a; font-family: monospace;">${paymentIntentId}</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Total Paid</td>
                <td align="right" style="font-size: 16px; color: #4f46e5; font-weight: 800;">$${totalFormatted} USD</td>
              </tr>
            </table>

          </div>

          <div style="background-color: #eef2ff; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4338ca; letter-spacing: 0.5px;">
              Verified Buyer Verification Credentials
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #3730a3;">
              Use your Order ID along with your email address (<strong>${cleanCustomerEmail}</strong>) when leaving product ratings or reviews:
            </p>
            <div style="background-color: #ffffff; border: 1px solid #c7d2fe; padding: 10px 16px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e1b4b; display: inline-block;">
              Order ID: #${orderId}
            </div>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${siteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Return to Pegty
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">
          © ${new Date().getFullYear()} Pegty. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✉️ Order confirmation email delivered to ${cleanCustomerEmail}. MessageId: ${info.messageId}`,
    );
    return info;
  } catch (error) {
    console.error("❌ Hostinger Webmail Transmission Failure:");
    console.error("Message:", error.message);
    if (error.response) console.error("Server Response:", error.response);
    throw error;
  }
}

module.exports = { sendOrderConfirmationEmail };
