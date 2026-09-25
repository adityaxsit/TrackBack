require("dotenv").config();

const axios = require("axios");
const { LeetCode, Credential } = require("leetcode-query");


// ===============================
// FULL LEETCODE SUBMISSIONS
// ===============================

const getAllSubmissions = async () => {
  const credential = new Credential();

  await credential.init(process.env.LEETCODE_SESSION);

  const leetcode = new LeetCode(credential);

  const allSubmissions = [];
  const limit = 20;
  let offset = 0;

  while (true) {
    console.log(`Fetching submissions: offset ${offset}`);

    const submissions = await leetcode.submissions({
      limit,
      offset,
    });

    if (!submissions || submissions.length === 0) {
      break;
    }

    allSubmissions.push(...submissions);

    if (submissions.length < limit) {
      break;
    }

    offset += limit;
  }

  console.log(`Total submissions fetched: ${allSubmissions.length}`);

  return allSubmissions;
};


// ===============================
// RECENT LEETCODE SUBMISSIONS
// ===============================

const getRecentSubmissions = async (username) => {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(
        username: $username
        limit: $limit
      ) {
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: {
          username,
          limit: 20,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36",
        },
        timeout: 15000,
      }
    );

    if (response.data.errors) {
      throw new Error(
        response.data.errors[0]?.message ||
          "LeetCode GraphQL request failed"
      );
    }

    const submissions =
      response.data?.data?.recentAcSubmissionList || [];

    return submissions;

  } catch (error) {
    console.error(
      "Recent LeetCode submission fetch failed:",
      error.message
    );

    throw error;
  }
};


// ===============================
// PROBLEM DETAILS
// ===============================

const getProblemDetails = async (titleSlug) => {
  const credential = new Credential();

  await credential.init(process.env.LEETCODE_SESSION);

  const leetcode = new LeetCode(credential);

  const problem = await leetcode.problem(titleSlug);

  return problem;
};


module.exports = {
  getAllSubmissions,
  getRecentSubmissions,
  getProblemDetails,
};