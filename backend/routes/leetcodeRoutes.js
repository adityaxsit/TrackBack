const express = require("express");

const {
  importLeetCodeProblems,
  syncLeetCodeProblems,
} = require("../controllers/leetcodeController");

const router = express.Router();

router.post("/", importLeetCodeProblems);

router.post("/sync", syncLeetCodeProblems);

module.exports = router;