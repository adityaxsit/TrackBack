const express = require("express");
const { getProblems,createProblem,updateProblem,deleteProblem } = require("../controllers/problemControllers");

const router = express.Router();

router.get("/", getProblems);
router.post("/", createProblem);
router.patch("/:id", updateProblem);
router.delete("/:id", deleteProblem);

module.exports = router;