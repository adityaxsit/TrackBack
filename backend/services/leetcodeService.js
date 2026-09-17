require("dotenv").config();

const { LeetCode, Credential } = require("leetcode-query");

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

const getProblemDetails = async (titleSlug) => {
  const credential = new Credential();

  await credential.init(process.env.LEETCODE_SESSION);

  const leetcode = new LeetCode(credential);

  const problem = await leetcode.problem(titleSlug);

  return problem;
};

const getRecentSubmissions = async () => {
  const credential = new Credential();

  await credential.init(process.env.LEETCODE_SESSION);

  const leetcode = new LeetCode(credential);

  const submissions = await leetcode.submissions({
    limit: 20,
    offset: 0,
  });

  return submissions;
};

module.exports = {
  getAllSubmissions,
  getProblemDetails,
  getRecentSubmissions,
};