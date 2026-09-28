const Problem = require("../models/Problem");

const getProblems = async (req, res) => {
  try {
    console.log("JWT userId:", req.user.userId);

    const allProblems = await Problem.find({});

    console.log("Total problems Mongoose sees:", allProblems.length);

    const problems = await Problem.find({
      userId: req.user.userId,
    });

    console.log("Problems found:", problems.length);

    res.status(200).json({ problems });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      userId: req.user.userId,
    });

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

const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json({
      message: "Problem updated successfully",
      problem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update problem",
      error: error.message,
    });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json({
      message: "Problem deleted successfully",
      problem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete problem",
      error: error.message,
    });
  }
};

module.exports = {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem
};