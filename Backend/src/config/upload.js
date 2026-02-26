const multer = require("multer");
const sharp = require("sharp");
const { cloudinary } = require("./cloudinary");
const fs = require("fs").promises; // ✅ use promise-based fs
const path = require("path");

const upload = multer({ dest: "uploads/" });

async function optimizeAndUpload(req, res, next) {
  try {
    let files = [];

    // If single file is uploaded (using upload.single)
    if (req.file) {
      files = [req.file];
    }
    // If multiple files are uploaded (using upload.array)
    else if (req.files) {
      files = req.files;
    }

    if (files.length === 0) {
      return next();
    }

    const uploadedFiles = [];

    for (const file of files) {
      let result;

      if (file.mimetype.startsWith("image/")) {
        const optimizedPath = path.join("uploads", `optimized-${file.filename}.webp`);

        await sharp(file.path)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(optimizedPath);

        result = await cloudinary.uploader.upload(optimizedPath, {
          folder: "ecommerce",
          resource_type: "image",
        });

        await Promise.allSettled([
          fs.unlink(file.path),
          fs.unlink(optimizedPath),
        ]);
      }
      else if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) {
        result = await cloudinary.uploader.upload(file.path, {
          folder: "ecommerce",
          resource_type: "video",
        });

        await fs.unlink(file.path).catch(() => {});
      } 
      else {
        await fs.unlink(file.path).catch(() => {});
        continue;
      }

      uploadedFiles.push({
        url: result.secure_url,
        public_id: result.public_id,
        type: file.mimetype,
      });
    }

    req.optimizedImages = uploadedFiles;
    next();
  } catch (error) {
    console.error("❌ Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
}

module.exports = { upload, optimizeAndUpload };
