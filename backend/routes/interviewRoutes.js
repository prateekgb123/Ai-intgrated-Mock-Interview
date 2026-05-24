const express =
  require("express");

const router =
  express.Router();

const {
  generateGeneralInterview,
  evaluateAnswer,
} = require(
  "../controllers/interviewController"
);

router.post(
  "/general",
  generateGeneralInterview
);

router.post(
  "/evaluate",
  evaluateAnswer
);

module.exports = router;