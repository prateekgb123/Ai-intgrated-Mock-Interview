const express =
require("express");

const multer =
require("multer");

const router =
express.Router();

const {
analyzeResume
}
=
require(
"../controllers/resumeAnalysisController"
);

const upload =
multer({
dest:"uploads/"
});

router.post(
"/",
upload.single("resume"),
analyzeResume
);

module.exports =
router;