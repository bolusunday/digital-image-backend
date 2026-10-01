// fix-s3-metadata.js
require("dotenv").config();
const {
  ListObjectsV2Command,
  CopyObjectCommand,
} = require("@aws-sdk/client-s3");
const s3Client = require("./config/s3");

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function fixThumbnailsMetadata() {
  try {
    console.log("🔍 Searching for images in thumbnails/ folder...");

    const listCmd = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "thumbnails/",
    });

    const data = await s3Client.send(listCmd);

    if (!data.Contents || data.Contents.length === 0) {
      console.log("No files found in thumbnails/ folder.");
      return;
    }

    for (const item of data.Contents) {
      if (item.Key.endsWith("/")) continue; // Skip folder key

      // Determine correct MIME type
      let contentType = "image/jpeg";
      if (item.Key.endsWith(".webp")) contentType = "image/webp";
      if (item.Key.endsWith(".png")) contentType = "image/png";

      console.log(`⚡ Updating metadata for: ${item.Key}...`);

      // Overwrite the file in-place with new Content-Type and Content-Disposition
      const copyCmd = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: encodeURIComponent(`${BUCKET_NAME}/${item.Key}`),
        Key: item.Key,
        ContentType: contentType,
        ContentDisposition: "inline",
        MetadataDirective: "REPLACE",
      });

      await s3Client.send(copyCmd);
      console.log(`✅ Updated: ${item.Key}`);
    }

    console.log(
      "\n🎉 Done! All existing thumbnail images now load inline in browsers.",
    );
  } catch (err) {
    console.error("❌ Error updating metadata:", err.message);
  }
}

fixThumbnailsMetadata();
