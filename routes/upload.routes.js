import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.post("/add-image", upload.single("image"), async (req, res) => {
  try {
    // console.log("Received file:", req.file); // Log the uploaded file object
    const result = await cloudinary.uploader.upload(req.file.path);
    // console.log("Uploaded image result:", result); // Log the Cloudinary upload result
    res.status(200).json({ url: result.url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Error uploading image" });
  }
});

export default router;
