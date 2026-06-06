const express =
require("express");

const router =
express.Router();

const {
getQuestion,
submitCode
}
=
require(
"../controllers/codingController"
);

router.get(
"/question",
getQuestion
);

router.post(
"/submit",
submitCode
);

module.exports =
router;