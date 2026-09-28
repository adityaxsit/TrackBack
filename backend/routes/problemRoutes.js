const express = require("express");

const {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemControllers");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getProblems);
router.post("/", authMiddleware, createProblem);
router.patch("/:id", authMiddleware, updateProblem);
router.delete("/:id", authMiddleware, deleteProblem);

module.exports = router;