const express = require("express");

const {
  syncLeetCodeProblems,
  importLeetCodeProblems,
} = require("../controllers/leetcodeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/sync", authMiddleware, syncLeetCodeProblems);
router.post("/import", authMiddleware, importLeetCodeProblems);
module.exports = router;