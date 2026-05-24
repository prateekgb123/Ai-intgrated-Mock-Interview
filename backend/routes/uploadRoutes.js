const express = require("express");
const multer = require("multer");

const {
  uploadResume,
} = require("../controllers/uploadController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/resume",
  upload.single("resume"),
  uploadResume
);

module.exports = router;