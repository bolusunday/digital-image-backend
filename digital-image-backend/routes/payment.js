const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { generateSecureDownloadLink } = require("../utils/downloadSigner");
const { sendOrderConfirmationEmail } = require("../utils/emailService");

// Safe Stripe Initialization Guard
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecretKey) {
  stripe = require("stripe")(stripeSecretKey);
} else {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY is missing in environment variables. Payment routes are disabled.",
  );
}

// Route: POST /api/payments/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      error:
        "Payment gateway is not configured. STRIPE_SECRET_KEY is missing on server.",
    });
  }

  try {
    const { productIds, email } = req.body;
    const userId = req.user ? req.user.id : "guest";

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

    const sanitizedIds = productIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    if (sanitizedIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs provided." });
    }

    const productQuery = await pool.query(
      "SELECT id, title, description, price, public_thumb_url FROM products WHERE id = ANY($1)",
      [sanitizedIds],
    );

    if (productQuery.rows.length === 0) {
      return res.status(400).json({ error: "No matching products found." });
    }

    const dbProducts = productQuery.rows;

    const lineItems = dbProducts.map((product) => {
      const rawImage = product.public_thumb_url;
      const isValidHttpUrl =
        typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description || undefined,
            images: isValidHttpUrl ? [rawImage] : [],
          },
          unit_amount: Math.round(Number(product.price)),
        },
        quantity: 1,
      };
    });

    const rawClientUrl = process.env.CLIENT_URL || "https://pegty.com";
    const clientBaseUrl = rawClientUrl.replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: email && email.includes("@") ? email : undefined,
      success_url: `${clientBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/cart`,
      metadata: {
        userId: userId.toString(),
        productIds: JSON.stringify(sanitizedIds),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Checkout session creation error details:", error);
    res.status(500).json({
      error: "Failed to initialize payment gateway.",
      details: error.message,
    });
  }
});

// Route: GET /api/payments/verify-payment (RACE-CONDITION SAFE)
router.get("/verify-payment", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      error:
        "Payment gateway is not configured. STRIPE_SECRET_KEY is missing on server.",
    });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id parameter." });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment has not been completed." });
    }

    const rawUserId = session.metadata?.userId;
    const userId =
      rawUserId === "guest" || !rawUserId ? null : parseInt(rawUserId, 10);
    const productIds = session.metadata?.productIds
      ? JSON.parse(session.metadata.productIds)
      : [];
    const paymentIntentId = session.payment_intent || session.id;
    const customerEmail =
      session.customer_details?.email || session.customer_email || "";

    if (productIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for this purchase." });
    }

    let dbOrderId = null;
    let isNewOrder = false;

    // Check existing order first
    const existingOrder = await pool.query(
      `SELECT id FROM orders WHERE stripe_payment_intent_id = $1 LIMIT 1`,
      [paymentIntentId],
    );

    if (existingOrder.rows.length > 0) {
      dbOrderId = existingOrder.rows[0].id;
    } else {
      const totalAmountCents = session.amount_total || 0;
      const firstProductId = productIds[0];

      // Atomic insert preventing duplicate records if Webhook fires simultaneously
      const newOrderResult = await pool.query(
        `INSERT INTO orders (user_id, customer_email, stripe_payment_intent_id, product_id, status, total_amount, created_at)
         VALUES ($1, $2, $3, $4, 'completed', $5, NOW())
         ON CONFLICT (stripe_payment_intent_id) DO NOTHING
         RETURNING id`,
        [
          userId,
          customerEmail,
          paymentIntentId,
          firstProductId,
          totalAmountCents,
        ],
      );

      if (newOrderResult.rows.length > 0) {
        dbOrderId = newOrderResult.rows[0].id;
        isNewOrder = true;

        const productQuery = await pool.query(
          "SELECT id, price FROM products WHERE id = ANY($1)",
          [productIds],
        );

        for (const item of productQuery.rows) {
          await pool.query(
            `INSERT INTO order_items (order_id, product_id, price_at_sale) VALUES ($1, $2, $3)`,
            [dbOrderId, item.id, item.price],
          );

          await pool.query(
            "UPDATE products SET sales_count = COALESCE(sales_count, 0) + 1 WHERE id = $1",
            [item.id],
          );
        }
        console.log(
          `✅ Order #${dbOrderId} saved via verify-payment fallback.`,
        );

        // Only send email if order was newly created by this request
        try {
          await sendOrderConfirmationEmail({
            customerEmail,
            orderId: dbOrderId,
            paymentIntentId,
            totalAmountCents,
          });
          console.log(
            `✉️ Order confirmation email sent to ${customerEmail} (via verify-payment)`,
          );
        } catch (emailErr) {
          console.error(
            "❌ Error sending email in verify-payment fallback:",
            emailErr.message,
          );
        }
      } else {
        // Fallback query if conflict occurred (webhook won the race)
        const recheck = await pool.query(
          `SELECT id FROM orders WHERE stripe_payment_intent_id = $1 LIMIT 1`,
          [paymentIntentId],
        );
        dbOrderId = recheck.rows[0]?.id || null;
      }
    }

    // Generate signed download links
    const productQuery = await pool.query(
      "SELECT id, title, private_file_key FROM products WHERE id = ANY($1)",
      [productIds],
    );

    const files = await Promise.all(
      productQuery.rows.map(async (product) => {
        const downloadUrl = await generateSecureDownloadLink(
          product.private_file_key,
          3600,
        );
        return {
          id: product.id,
          title: product.title,
          downloadUrl: downloadUrl,
        };
      }),
    );

    res.json({
      success: true,
      orderId: dbOrderId || paymentIntentId,
      stripePaymentIntentId: paymentIntentId,
      customerEmail: customerEmail,
      downloadUrl: files[0]?.downloadUrl,
      files: files,
    });
  } catch (error) {
    console.error("❌ Error verifying payment session:", error.message);
    res
      .status(500)
      .json({ error: "Failed to verify purchase and generate download link." });
  }
});

module.exports = router;
