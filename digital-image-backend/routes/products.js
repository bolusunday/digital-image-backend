// routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const pool = require("../config/db");
const s3Client = require("../config/s3");
const verifyToken = require("../middleware/authMiddleware");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Helper function to turn a product title into a URL slug
const createSlug = (title) => {
  return (title || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper function to resolve integer Product ID from numeric ID string or slug
const resolveProductId = async (identifier) => {
  if (!identifier) return null;
  const isNumeric = /^\d+$/.test(identifier);
  if (isNumeric) {
    return parseInt(identifier, 10);
  }
  const result = await pool.query(
    "SELECT id FROM products WHERE slug = $1 LIMIT 1",
    [identifier],
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
};

// ----------------------------------------------------------------------
// 1. CONFIGURE MULTER-S3 FOR FILE UPLOADS
// ----------------------------------------------------------------------
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: (req, file, cb) => {
      cb(null, process.env.AWS_BUCKET_NAME);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      let folder = "originals";
      if (file.fieldname === "thumbnail") folder = "thumbnails";
      if (file.fieldname === "gallery") folder = "gallery";

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
    { name: "gallery", maxCount: 10 },
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
// 2. GET /api/products (Fetch All Products - Includes Slugs)
// ----------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, slug, description, price, category, public_thumb_url, images, rating_average, rating_count, sales_count, created_at FROM products ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to load products." });
  }
});

// ----------------------------------------------------------------------
// 3. GET /api/products/:identifier/reviews (Fetch Reviews by ID or Slug)
// ----------------------------------------------------------------------
router.get("/:identifier/reviews", async (req, res) => {
  const { identifier } = req.params;

  try {
    const productId = await resolveProductId(identifier);

    if (!productId) {
      return res.status(404).json({ error: "Product not found." });
    }

    const result = await pool.query(
      `SELECT id, user_name, rating, comment, created_at 
       FROM reviews 
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err.message);
    res.status(500).json({ error: "Failed to load reviews." });
  }
});

// ----------------------------------------------------------------------
// 4. GET /api/products/:identifier (Fetch Single Product by ID or Slug)
// ----------------------------------------------------------------------
router.get("/:identifier", async (req, res) => {
  const { identifier } = req.params;
  const isNumeric = /^\d+$/.test(identifier);

  try {
    const query = isNumeric
      ? "SELECT * FROM products WHERE id = $1 LIMIT 1"
      : "SELECT * FROM products WHERE slug = $1 LIMIT 1";

    const result = await pool.query(query, [
      isNumeric ? parseInt(identifier, 10) : identifier,
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
// 5. POST /api/products/upload (Protected Route - Auto-Generates Slug)
// ----------------------------------------------------------------------
router.post("/upload", verifyToken, uploadFields, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required." });
    }

    const thumbnailFile = req.files?.["thumbnail"]?.[0];
    const originalFile = req.files?.["original_file"]?.[0];
    const galleryFiles = req.files?.["gallery"] || [];

    if (!thumbnailFile || !originalFile) {
      return res.status(400).json({
        error: "Both a thumbnail image and original file are required.",
      });
    }

    const publicThumbUrl = thumbnailFile.location;
    const privateFileKey = originalFile.key;

    const galleryUrls = galleryFiles.map((file) => file.location);
    const imagesList = [publicThumbUrl, ...galleryUrls];

    const priceInCents = Math.round(parseFloat(price) * 100);

    if (isNaN(priceInCents)) {
      return res.status(400).json({ error: "Invalid price provided." });
    }

    // 1. Insert product first to get product ID
    const insertQuery = `
      INSERT INTO products (title, description, price, public_thumb_url, private_file_key, category, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      title,
      description || "",
      priceInCents,
      publicThumbUrl,
      privateFileKey,
      category || "General",
      imagesList,
    ];

    const newProductResult = await pool.query(insertQuery, values);
    const insertedProduct = newProductResult.rows[0];

    // 2. Generate slug with keyword + ID and update product
    const generatedSlug = `${createSlug(title)}-${insertedProduct.id}`;
    const updateSlugResult = await pool.query(
      `UPDATE products SET slug = $1 WHERE id = $2 RETURNING *`,
      [generatedSlug, insertedProduct.id],
    );

    res.status(201).json({
      message: "Product created successfully!",
      product: updateSlugResult.rows[0],
    });
  } catch (err) {
    console.error("❌ DATABASE INSERT ERROR:", err.message);
    res.status(500).json({ error: "Server error saving product to database." });
  }
});

// ----------------------------------------------------------------------
// 6. DELETE /api/products/:id (Protected Route)
// ----------------------------------------------------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      "SELECT public_thumb_url, private_file_key, images FROM products WHERE id = $1",
      [id],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    const { public_thumb_url, private_file_key, images } =
      productResult.rows[0];

    const bucketName = process.env.AWS_BUCKET_NAME;
    const deletePromises = [];

    const extractS3Key = (url) => {
      if (url && url.includes(".amazonaws.com/")) {
        return url.split(".amazonaws.com/")[1];
      }
      return null;
    };

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

    const thumbKey = extractS3Key(public_thumb_url);
    if (thumbKey) {
      deletePromises.push(
        s3Client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: thumbKey }),
        ),
      );
    }

    if (Array.isArray(images)) {
      images.forEach((imgUrl) => {
        const key = extractS3Key(imgUrl);
        if (key && key !== thumbKey) {
          deletePromises.push(
            s3Client.send(
              new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
            ),
          );
        }
      });
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
// 7. POST /api/products/:id/guest-reviews (Supports ID and Slug)
// ----------------------------------------------------------------------
router.post("/:id/guest-reviews", async (req, res) => {
  const { id } = req.params;
  const productId = await resolveProductId(id);

  if (!productId) {
    return res.status(404).json({ error: "Product not found." });
  }

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
