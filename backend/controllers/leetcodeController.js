const Problem = require("../models/Problem");

const {
  getAllSubmissions,
  getProblemDetails,
  getRecentSubmissions,
} = require("../services/leetcodeService");

const importLeetCodeProblems = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "LeetCode username is required",
      });
    }

    const submissions = await getAllSubmissions();

    let imported = [];
    let skipped = [];

    for (const submission of submissions) {
      

      // Only process accepted submissions
      if (submission.statusDisplay !== "Accepted") {
        continue;
      }

      const problemUrl = `https://leetcode.com/problems/${submission.titleSlug}/`;

      // Check for duplicates
      const existingProblem = await Problem.findOne({
        platform: "LeetCode",
        problemUrl,
      });

      if (existingProblem) {
        skipped.push(submission.title);
        continue;
      }

      // Get problem details
      const details = await getProblemDetails(
        submission.titleSlug
      );

      // Extract topics
      const topics = details.topicTags
        ? details.topicTags.map((tag) => tag.name)
        : [];

      // Create problem
      const problem = await Problem.create({
        title: submission.title,
        platform: "LeetCode",
        topic: topics.join(", "),
        difficulty: details.difficulty || "Unknown",
        companies: [],
        revision: false,
        solvedAt: new Date(Number(submission.timestamp)),
        problemUrl,
        notes: "",
      });

      imported.push(problem);
    }

    res.status(201).json({
      message: "LeetCode problems imported successfully",
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
    });

  } catch (error) {
    console.error(
      "LeetCode import failed:",
      error.message
    );

    res.status(500).json({
      message: "Failed to import LeetCode problems",
      error: error.message,
    });
  }
};

const syncLeetCodeProblems = async (req, res) => {
  try {
    const submissions = await getRecentSubmissions();

    // Only accepted submissions
    const acceptedSubmissions = submissions.filter(
      (submission) => submission.statusDisplay === "Accepted"
    );

    // Remove duplicate submissions
    const uniqueProblems = new Map();

    for (const submission of acceptedSubmissions) {
      if (!uniqueProblems.has(submission.titleSlug)) {
        uniqueProblems.set(submission.titleSlug, submission);
      }
    }

    let imported = [];
    let skipped = [];

    for (const submission of uniqueProblems.values()) {
      const problemUrl = `https://leetcode.com/problems/${submission.titleSlug}/`;

      // Check if problem already exists
      const existingProblem = await Problem.findOne({
        platform: "LeetCode",
        problemUrl,
      });

      if (existingProblem) {
        skipped.push(submission.title);
        continue;
      }

      console.log(`New problem found: ${submission.title}`);

      // Fetch problem details
      const details = await getProblemDetails(
        submission.titleSlug
      );

      const topics = details.topicTags
        ? details.topicTags.map((tag) => tag.name)
        : [];

      const problem = await Problem.create({
        title: submission.title,
        platform: "LeetCode",
        topic: topics.join(", ") || "Uncategorized",
        difficulty: details.difficulty || "Unknown",
        companies: [],
        revision: false,
        solvedAt: new Date(submission.timestamp),
        problemUrl,
        notes: "",
      });

      imported.push(problem);
    }

    res.status(200).json({
      message: "LeetCode sync completed successfully",
      checkedSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      uniqueProblemsChecked: uniqueProblems.size,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
    });

  } catch (error) {
    console.error(
      "LeetCode sync failed:",
      error.message
    );

    res.status(500).json({
      message: "Failed to sync LeetCode problems",
      error: error.message,
    });
  }
};

module.exports = {
  importLeetCodeProblems,
  syncLeetCodeProblems,
};