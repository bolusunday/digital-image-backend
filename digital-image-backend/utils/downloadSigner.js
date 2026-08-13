const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// 1. Resolve Bucket Name
const BUCKET_NAME =
  process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;

// 2. Safely initialize S3 Client with fallback checks
const region = process.env.AWS_REGION || "eu-north-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let s3Client;

if (accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
} else {
  // Fallback to default SDK chain (env vars / IAM Roles)
  s3Client = new S3Client({ region });
}

/**
 * Generates a temporary pre-signed URL for downloading a private file from S3.
 */
async function generateSecureDownloadLink(fileKey, expiresInSeconds = 3600) {
  try {
    if (!fileKey) {
      throw new Error("Missing S3 fileKey parameter.");
    }

    if (!BUCKET_NAME) {
      throw new Error(
        "AWS Bucket Name is missing. Set AWS_BUCKET_NAME in your .env file.",
      );
    }

    // Clean fileKey (strip leading slashes if stored like "/downloads/file.zip")
    const cleanKey = fileKey.replace(/^\/+/, "");

    // Prepare S3 Get Object Command
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: cleanKey,
      ResponseContentDisposition: "attachment",
    });

    // Generate expiring pre-signed URL
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return signedUrl;
  } catch (error) {
    console.error(
      "❌ Error generating S3 signed download link:",
      error.message,
    );
    throw error;
  }
}

module.exports = {
  generateSecureDownloadLink,
};
