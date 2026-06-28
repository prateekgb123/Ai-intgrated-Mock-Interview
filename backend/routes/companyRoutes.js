const express = require("express");

const router = express.Router();

const {
  generateCompanyPrep
} = require("../controllers/companyController");

router.post(
  "/generate",
  generateCompanyPrep
);

module.exports = router;