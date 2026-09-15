const express = require("express");
const { getProblems,createProblem } = require("../controllers/problemControllers");

const router = express.Router();

router.get("/", getProblems);
router.post("/", createProblem);

module.exports = router;