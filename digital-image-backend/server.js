const path = require("path");
require("dotenv").config({
  path: [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../config/.env"),
  ],
});

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

// Safe Stripe initialization guard
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require("stripe")(stripeSecretKey) : null;
if (!stripe) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY is missing. Stripe webhook features disabled.",
  );
}

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const productRoutes = require("./routes/products");
const verifyToken = require("./middleware/authMiddleware");
const { generateSecureDownloadLink } = require("./utils/downloadSigner");
const { sendOrderConfirmationEmail } = require("./utils/emailService");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable reverse proxy trust for Hostinger/Cloudflare SSL termination
app.set("trust proxy", 1);

// --------------- Production CORS Policy ---------------
const allowedOrigins = [
  "https://pegty.com",
  "https://www.pegty.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman) or matched allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked request from: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --------------- Stripe Webhook Listener (MUST BE BEFORE express.json) ---------------
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      return res
        .status(500)
        .json({ error: "Stripe is not configured on server." });
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const rawUserId = session.metadata?.userId;
      const userId =
        rawUserId === "guest" || !rawUserId ? null : parseInt(rawUserId, 10);
      const productIds = session.metadata?.productIds
        ? JSON.parse(session.metadata.productIds)
        : [];
      const paymentIntentId = session.payment_intent || session.id;
      const totalAmountCents = session.amount_total;

      const customerEmail =
        session.customer_details?.email || session.customer_email || null;

      try {
        const existingOrder = await pool.query(
          `SELECT id FROM orders WHERE stripe_payment_intent_id = $1 LIMIT 1`,
          [paymentIntentId],
        );

        if (existingOrder.rows.length === 0) {
          const firstProductId = productIds.length > 0 ? productIds[0] : null;
          const orderResult = await pool.query(
            `INSERT INTO orders (user_id, customer_email, stripe_payment_intent_id, product_id, status, total_amount, created_at)
             VALUES ($1, $2, $3, $4, 'completed', $5, NOW())
             RETURNING id`,
            [
              userId,
              customerEmail,
              paymentIntentId,
              firstProductId,
              totalAmountCents,
            ],
          );

          const orderId = orderResult.rows[0].id;

          if (productIds.length > 0) {
            const productQuery = await pool.query(
              "SELECT id, price FROM products WHERE id = ANY($1)",
              [productIds],
            );

            for (const item of productQuery.rows) {
              await pool.query(
                `INSERT INTO order_items (order_id, product_id, price_at_sale)
                 VALUES ($1, $2, $3)`,
                [orderId, item.id, item.price],
              );

              await pool.query(
                "UPDATE products SET sales_count = COALESCE(sales_count, 0) + 1 WHERE id = $1",
                [item.id],
              );
            }
          }

          console.log(
            `✅ Order #${orderId} fulfilled successfully for (${customerEmail}).`,
          );

          try {
            await sendOrderConfirmationEmail({
              customerEmail,
              orderId,
              paymentIntentId,
              totalAmountCents,
            });
            console.log(`✉️ Order confirmation email sent to ${customerEmail}`);
          } catch (emailErr) {
            console.error(
              "❌ Error sending confirmation email:",
              emailErr.message,
            );
          }
        }
      } catch (dbErr) {
        console.error(
          "❌ Database fulfillment error during webhook:",
          dbErr.message,
        );
      }
    }

    res.json({ received: true });
  },
);

// Global JSON Parsing Middleware
app.use(express.json());

// --------------- Root & Health Check Routes ---------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Pegty API is online and healthy 🚀",
    healthCheck: "https://api.pegty.com/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", domain: "pegty.com", timestamp: new Date() });
});

// Mount Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);

// --------------- Protected Asset Routes ---------------
app.get("/api/download/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const purchaseCheck = await pool.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'completed'`,
      [userId, productId],
    );

    if (purchaseCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Access denied. You have not purchased this item." });
    }

    const productResult = await pool.query(
      "SELECT private_file_key FROM products WHERE id = $1",
      [productId],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product file not found." });
    }

    const fileKey = productResult.rows[0].private_file_key;
    const secureUrl = await generateSecureDownloadLink(fileKey, 3600);

    res.json({
      message: "Access granted. Link expires in 1 hour.",
      downloadUrl: secureUrl,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Failed to process download authorization." });
  }
});

// --------------- Admin Product Edit Route ---------------
app.put("/api/admin/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { title, description, price, category, public_thumb_url } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID format." });
  }

  if (!title || price === undefined || price === null || isNaN(Number(price))) {
    return res
      .status(400)
      .json({ error: "Title and a valid Price are required." });
  }

  try {
    const safeDescription = description ?? null;
    const safeThumbUrl = public_thumb_url ?? null;
    const safePrice = Number(price);
    const safeCategory = (category || "sport").toLowerCase().trim();

    const updateResult = await pool.query(
      `UPDATE products 
       SET title = $1, 
           description = $2, 
           price = $3, 
           category = $4,
           public_thumb_url = $5
       WHERE id = $6 
       RETURNING *`,
      [
        title,
        safeDescription,
        safePrice,
        safeCategory,
        safeThumbUrl,
        productId,
      ],
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json({
      message: "Product updated successfully!",
      product: updateResult.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating product in database:", error.message);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// --------------- Reviews API Routes ---------------
app.get("/api/products/:id/reviews", async (req, res) => {
  const productId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT id, user_name, rating, comment, created_at 
       FROM reviews 
       WHERE product_id = CAST($1 AS INTEGER)
       ORDER BY created_at DESC`,
      [productId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ error: "Failed to load reviews." });
  }
});

app.post("/api/products/:id/guest-reviews", async (req, res) => {
  const productId = req.params.id;
  const { orderId, email, customer_email, rating, comment, displayName } =
    req.body;

  const userEmail = String(email || customer_email || "")
    .toLowerCase()
    .trim();
  const cleanOrderId = String(orderId || "").trim();

  if (!cleanOrderId || !userEmail) {
    return res.status(400).json({
      error: "Order ID and Email are required to verify your purchase.",
    });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const matchCheck = await client.query(
      `SELECT o.id 
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE (CAST(o.id AS TEXT) = $1 OR o.stripe_payment_intent_id = $1) 
         AND LOWER(TRIM(o.customer_email)) = $2
         AND (oi.product_id = CAST($3 AS INTEGER) OR o.product_id = CAST($3 AS INTEGER))
         AND o.status IN ('completed', 'paid', 'delivered', 'succeeded')
       LIMIT 1`,
      [cleanOrderId, userEmail, productId],
    );

    if (matchCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error:
          "We couldn't find a completed purchase matching that Order ID and Email for this product.",
      });
    }

    const verifiedOrderId = matchCheck.rows[0].id;

    const duplicateCheck = await client.query(
      `SELECT id FROM reviews WHERE order_id = $1 AND product_id = CAST($2 AS INTEGER)`,
      [verifiedOrderId, productId],
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "A review has already been submitted for this order.",
      });
    }

    const reviewerName = displayName?.trim() || "Verified Buyer";
    const newReview = await client.query(
      `INSERT INTO reviews (product_id, order_id, guest_email, user_name, rating, comment, created_at)
       VALUES (CAST($1 AS INTEGER), $2, $3, $4, $5, $6, NOW())
       RETURNING id, product_id, user_name, rating, comment, created_at`,
      [
        productId,
        verifiedOrderId,
        userEmail,
        reviewerName,
        rating,
        comment || null,
      ],
    );

    const statsResult = await client.query(
      `SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE product_id = CAST($1 AS INTEGER)`,
      [productId],
    );

    const newCount = parseInt(statsResult.rows[0].count, 10);
    const newAverage = parseFloat(
      Number(statsResult.rows[0].average).toFixed(1),
    );

    await client.query(
      `UPDATE products SET rating_average = $1, rating_count = $2 WHERE id = CAST($3 AS INTEGER)`,
      [newAverage, newCount, productId],
    );

    await client.query("COMMIT");

    res.json({
      message: "Review verified and published!",
      review: newReview.rows[0],
      stats: { rating_average: newAverage, rating_count: newCount },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Guest review submission error:", err);
    res.status(500).json({ error: "Failed to verify and post review." });
  } finally {
    client.release();
  }
});

// --------------- Non-blocking Database Initialization Function ---------------
async function initDbSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(100) DEFAULT 'sport',
        public_thumb_url TEXT,
        private_file_key TEXT,
        rating_average NUMERIC DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NULL,
        customer_email VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        product_id INTEGER,
        status VARCHAR(50) DEFAULT 'completed',
        total_amount INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER,
        price_at_sale INTEGER
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        order_id INTEGER,
        guest_email VARCHAR(255),
        user_name VARCHAR(255) DEFAULT 'Verified Buyer',
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'sport';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER NULL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id INTEGER;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_at_sale INTEGER;
      
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id INTEGER;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) DEFAULT 'Verified Buyer';
    `);

    const adminEmail = process.env.ADMIN_EMAIL || "adebolusunday86@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [adminEmail, hashedAdminPassword],
      );
      console.log(
        `✅ Database schema verified and admin user (${adminEmail}) synced.`,
      );
    } else {
      console.warn("⚠️ ADMIN_PASSWORD not set in .env. Admin seeding skipped.");
    }
  } catch (err) {
    console.error("❌ Database schema startup error:", err.message);
  }
}

// --------------- Start Server First ---------------
app.listen(PORT, () => {
  console.log(`🚀 Production server running for pegty.com on port ${PORT}`);
  initDbSchema();
});
