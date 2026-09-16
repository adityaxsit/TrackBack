import useFetch from "../hooks/useFetch.js";
import { useEffect, useState } from "react";
import styles from "./Problems.module.css";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function Problems() {
  const { data, loading, error } = useFetch("/api/problems");

  const [searchTerm, setSearchTerm] = useState("");
  const [platform, setPlatform] = useState("All platforms");
  const [difficulty, setDifficulty] = useState("All difficulties");
  const [revision, setRevision] = useState("All");
  const [sortBy, setSortBy] = useState("Newest solved");
  const [company, setCompany] = useState("All companies");

  const [problems, setProblems] = useState([]);

  useEffect(() => {
    if (data) {
      setProblems(data.problems);
    }
  }, [data]);

  const handleRevisionToggle = async (id) => {
    const problem = problems.find((problem) => problem._id === id);

    if (!problem) return;

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          revision: !problem.revision,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update revision");
      }

      const data = await response.json();

      setProblems((previousProblems) =>
        previousProblems.map((problem) =>
          problem._id === id ? data.problem : problem,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete problem");
      }

      setProblems((previousProblems) =>
        previousProblems.filter((problem) => problem._id !== id),
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setPlatform("All platforms");
    setDifficulty("All difficulties");
    setRevision("All");
    setCompany("All companies");
    setSortBy("Newest solved");
  };

  const filteredProblems = problems.filter((problem) => {
    const searchMatches = problem.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const platformMatches =
      platform === "All platforms" || problem.platform === platform;

    const difficultyMatches =
      difficulty === "All difficulties" || problem.difficulty === difficulty;

    const revisionMatches =
      revision === "All" ||
      (revision === "Needed" && problem.revision) ||
      (revision === "Not Needed" && !problem.revision);

    const companyMatches =
      company === "All companies" || problem.companies.includes(company);

    return (
      searchMatches &&
      platformMatches &&
      difficultyMatches &&
      revisionMatches &&
      companyMatches
    );
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortBy === "Newest solved") {
      return new Date(b.solvedAt) - new Date(a.solvedAt);
    }

    if (sortBy === "Oldest solved") {
      return new Date(a.solvedAt) - new Date(b.solvedAt);
    }

    return 0;
  });

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p>Error:{error}</p>;
  }

  const totalSolved = problems.length;
  const hardCount = problems.filter(
    (problem) => problem.difficulty === "Hard",
  ).length;
  const revisionCount = problems.filter((problem) => problem.revision).length;

  return (
    <div className={styles.problemsPage}>
      <section className={styles.header}>
        <h1>Problems</h1>
        <p>Track all solved problems from different coding platforms.</p>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Total Solved</p>
          <h2>{totalSolved}</h2>
        </article>

        <article className={styles.statCard}>
          <p className={styles.statLabel}>Hard Problems</p>
          <h2>{hardCount}</h2>
        </article>

        <article className={styles.statCard}>
          <p className={styles.statLabel}>Need Revision</p>
          <h2>{revisionCount}</h2>
        </article>
      </section>

      <section className={styles.controlsCard}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <label htmlFor="problemSearch">Search</label>
            <input
              id="problemSearch"
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.selectWrap}>
            <label htmlFor="platformFilter">Platform</label>
            <select
              id="platformFilter"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>All platforms</option>
              <option>LeetCode</option>
              <option>Codeforces</option>
              <option>GeeksforGeeks</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <label htmlFor="difficultyFilter">Difficulty</label>
            <select
              id="difficultyFilter"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>All difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <label htmlFor="revisionFilter">Revision</label>
            <select
              id="revisionFilter"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
            >
              <option>All</option>
              <option>Needed</option>
              <option>Not Needed</option>
            </select>
          </div>
          <div className={styles.selectWrap}>
            <label htmlFor="companyFilter">Company</label>

            <select
              id="companyFilter"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option>All companies</option>
              <option>Amazon</option>
              <option>Google</option>
              <option>Microsoft</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <label htmlFor="sortBy">Sort</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest solved</option>
              <option>Oldest solved</option>
            </select>
          </div>
          <button className={styles.resetButton} onClick={handleClearFilters}>
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset</span>
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span>Problem</span>
          <span>Platform</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span>Companies</span>
          <span>Revision</span>
          <span>Solved At</span>
          <span>Notes</span>
        </div>

        {sortedProblems.length === 0 ? (
          <div className={styles.emptyState}>
            No problems match your filters.
          </div>
        ) : (
          sortedProblems.map((problem) => (
            <div className={styles.tableRow} key={problem._id}>
              <a
                className={styles.problemTitle}
                href={problem.problemUrl}
                target="_blank"
                rel="noreferrer"
              >
                {problem.title}
              </a>

              <span className={styles.platformBadge}>{problem.platform}</span>

              <span>{problem.topic}</span>

              <span
                className={`${styles.difficulty} ${styles[problem.difficulty.toLowerCase()]}`}
              >
                {problem.difficulty}
              </span>

              <div className={styles.companyTags}>
                {problem.companies.map((company) => (
                  <span className={styles.companyTag} key={company}>
                    {company}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleRevisionToggle(problem._id)}
                className={
                  problem.revision ? styles.revisionYes : styles.revisionNo
                }
              >
                {problem.revision ? "Needed" : "Not Needed"}
              </button>

              <span>{new Date(problem.solvedAt).toLocaleDateString()}</span>

              <p className={styles.notes}>{problem.notes}</p>

              <button
                type="button"
                onClick={() => handleDeleteProblem(problem._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Problems;
