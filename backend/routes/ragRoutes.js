const express = require("express");

const {
  chatWithAI,
} = require("../controllers/ragController");

const router = express.Router();

router.post("/chat", chatWithAI);

module.exports = router;