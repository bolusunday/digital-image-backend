// routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const pool = require("../config/db");
const s3Client = require("../config/s3");
const verifyToken = require("../middleware/authMiddleware");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// ----------------------------------------------------------------------
// 1. CONFIGURE MULTER-S3 FOR FILE UPLOADS
// ----------------------------------------------------------------------
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: (req, file, cb) => {
      cb(null, process.env.AWS_BUCKET_NAME);
    },
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder =
        file.fieldname === "thumbnail" ? "thumbnails" : "originals";
      const cleanFileName = file.originalname.replace(/\s+/g, "-");
      const uniqueName = `${folder}/${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}-${cleanFileName}`;
      cb(null, uniqueName);
    },
  }),
});

// Middleware to wrap Multer and log S3 upload errors clearly
const uploadFields = (req, res, next) => {
  const multerHandler = upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "original_file", maxCount: 1 },
  ]);

  multerHandler(req, res, (err) => {
    if (err) {
      console.error("❌ MULTER/S3 UPLOAD ERROR:", err);
      return res.status(500).json({
        error: "Failed uploading files to S3.",
        details: err.message,
      });
    }
    next();
  });
};

// ----------------------------------------------------------------------
// 2. GET /api/products (Fetch All Products)
// ----------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, price, category, public_thumb_url, rating_average, rating_count, sales_count, created_at FROM products ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to load products." });
  }
});

// ----------------------------------------------------------------------
// 3. GET /api/products/:id (Fetch Single Product by ID)
// ----------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID format." });
  }

  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching product details:", err.message);
    res.status(500).json({ error: "Failed to load product details." });
  }
});

// ----------------------------------------------------------------------
// 4. POST /api/products/upload (Protected Route)
// ----------------------------------------------------------------------
router.post("/upload", verifyToken, uploadFields, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required." });
    }

    const thumbnailFile = req.files?.["thumbnail"]?.[0];
    const originalFile = req.files?.["original_file"]?.[0];

    if (!thumbnailFile || !originalFile) {
      return res.status(400).json({
        error: "Both a thumbnail image and original file are required.",
      });
    }

    const publicThumbUrl = thumbnailFile.location;
    const privateFileKey = originalFile.key;

    const priceInCents = Math.round(parseFloat(price) * 100);

    if (isNaN(priceInCents)) {
      return res.status(400).json({ error: "Invalid price provided." });
    }

    const insertQuery = `
      INSERT INTO products (title, description, price, public_thumb_url, private_file_key, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      title,
      description || "",
      priceInCents,
      publicThumbUrl,
      privateFileKey,
      category || "General",
    ];

    const newProduct = await pool.query(insertQuery, values);

    res.status(201).json({
      message: "Product created successfully!",
      product: newProduct.rows[0],
    });
  } catch (err) {
    console.error("❌ DATABASE INSERT ERROR:", err.message);
    res.status(500).json({ error: "Server error saving product to database." });
  }
});

// ----------------------------------------------------------------------
// 5. DELETE /api/products/:id (Protected Route)
// ----------------------------------------------------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      "SELECT public_thumb_url, private_file_key FROM products WHERE id = $1",
      [id],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    const { public_thumb_url, private_file_key } = productResult.rows[0];

    let thumbKey = null;
    if (public_thumb_url && public_thumb_url.includes(".amazonaws.com/")) {
      thumbKey = public_thumb_url.split(".amazonaws.com/")[1];
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const deletePromises = [];

    if (private_file_key) {
      deletePromises.push(
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: private_file_key,
          }),
        ),
      );
    }

    if (thumbKey) {
      deletePromises.push(
        s3Client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: thumbKey }),
        ),
      );
    }

    await Promise.allSettled(deletePromises);

    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    res.json({ message: "Product and associated files deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ----------------------------------------------------------------------
// 6. POST /api/products/:id/guest-reviews
// ----------------------------------------------------------------------
router.post("/:id/guest-reviews", async (req, res) => {
  const productId = Number(req.params.id);
  const { rating, orderId, email, customer_email, displayName, comment } =
    req.body;

  const rawEmail = email || customer_email || "";
  const normalizedEmail = String(rawEmail).toLowerCase().trim();
  const rawOrderId = String(orderId || "").trim();

  if (!rawOrderId || !normalizedEmail) {
    return res.status(400).json({
      error: "Order ID and Checkout Email are required to verify purchase.",
    });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res
      .status(400)
      .json({ error: "Rating must be a number between 1 and 5." });
  }

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID." });
  }

  try {
    const orderCheck = await pool.query(
      `SELECT id, product_id, customer_email 
       FROM orders 
       WHERE CAST(id AS TEXT) = $1 
         AND LOWER(customer_email) = $2 
         AND product_id = $3`,
      [rawOrderId, normalizedEmail, productId],
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({
        error:
          "We couldn't verify this purchase. Please double-check your Order ID and Checkout Email.",
      });
    }

    const verifiedOrder = orderCheck.rows[0];

    const duplicateCheck = await pool.query(
      `SELECT id FROM reviews WHERE CAST(order_id AS TEXT) = $1 AND product_id = $2`,
      [String(verifiedOrder.id), productId],
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: "A review has already been submitted for this order.",
      });
    }

    const productResult = await pool.query(
      "SELECT rating_average, rating_count FROM products WHERE id = $1",
      [productId],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    const currentAvg = Number(productResult.rows[0].rating_average) || 0;
    const currentCount = Number(productResult.rows[0].rating_count) || 0;

    const newRatingCount = currentCount + 1;
    const totalScore = currentAvg * currentCount + numericRating;
    const newRatingAverage = parseFloat(
      (totalScore / newRatingCount).toFixed(1),
    );

    const updateResult = await pool.query(
      `UPDATE products 
       SET rating_average = $1, rating_count = $2 
       WHERE id = $3 
       RETURNING *`,
      [newRatingAverage, newRatingCount, productId],
    );

    const insertReviewResult = await pool.query(
      `INSERT INTO reviews (product_id, order_id, user_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        productId,
        verifiedOrder.id,
        displayName || "Verified Buyer",
        numericRating,
        comment || "",
      ],
    );

    const review = insertReviewResult.rows[0] || {
      id: Date.now(),
      user_name: displayName || "Verified Buyer",
      rating: numericRating,
      comment: comment || "",
      created_at: new Date().toISOString(),
    };

    return res.json({
      message: "Purchase verified! Your review has been published.",
      product: updateResult.rows[0],
      review: review,
      stats: {
        rating_average: newRatingAverage,
        rating_count: newRatingCount,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting review:", {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return res.status(500).json({
      error: "Failed to verify and submit review.",
      details: error.message,
    });
  }
});

// Alias endpoint for backwards compatibility
router.post("/:id/review", async (req, res) => {
  req.url = `/${req.params.id}/guest-reviews`;
  return router.handle(req, res);
});

module.exports = router;
