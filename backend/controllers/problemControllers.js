const Problem = require("../models/Problem");

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();

    res.status(200).json({
      problems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);

    res.status(201).json({
      message: "Problem created successfully",
      problem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create problem",
      error: error.message,
    });
  }
};

module.exports = {
  getProblems,
  createProblem,
};