import useFetch from "../hooks/useFetch.js";
import { useState } from "react";
import styles from "./Revision.module.css";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function Revision() {
  const { data, loading, error } = useFetch("/api/problems");

  const [status, setStatus] = useState("queue");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const problems = data?.problems ?? [];

  // Only problems marked for revision
  const revisionProblems = problems.filter(
    (problem) => problem.revision === true,
  );

  // Mark problem as reviewed
  const handleMarkReviewed = async (problemId) => {
    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          revision: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update revision");
      }

      // Update UI immediately
      window.location.reload();
    } catch (error) {
      console.error("Failed to mark reviewed:", error);
    }
  };

  /*
    Current database model only has:

    revision: Boolean

    So there are no:
    - revisionStage
    - lastRevisedAt
    - nextRevisionAt

    Therefore, for now every marked problem is
    simply considered part of the revision queue.
  */

  const dueCount = revisionProblems.length;
  const overdueCount = 0;
  const upcomingCount = 0;

  const filteredProblems = revisionProblems.filter((problem) => {
    if (status === "queue") {
      return true;
    }

    // Scheduled revision statuses will be added later
    return false;
  });

  const sortedProblems = [...filteredProblems].sort(
    (a, b) => new Date(a.solvedAt) - new Date(b.solvedAt),
  );

  return (
    <div className={styles.revisionPage}>
      {/* HEADER */}

      <section className={styles.header}>
        <h1>Revision Queue</h1>

        <p>Focus on what needs review and keep your concepts strong.</p>
      </section>

      {/* STATS */}

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p>Marked for Revision</p>
          <h2>{dueCount}</h2>
        </article>

        <article className={styles.statCard}>
          <p>Overdue</p>
          <h2>{overdueCount}</h2>
        </article>

        <article className={styles.statCard}>
          <p>Upcoming</p>
          <h2>{upcomingCount}</h2>
        </article>

        <article className={styles.statCard}>
          <p>Total Revision Problems</p>
          <h2>{revisionProblems.length}</h2>
        </article>
      </section>

      {/* MAIN CONTENT */}

      <section className={styles.layoutGrid}>
        {/* QUEUE */}

        <div className={styles.queueCard}>
          <div className={styles.queueHeader}>
            <div>
              <h2>Revision Problems</h2>

              <span>{sortedProblems.length} problems</span>
            </div>

            <div className={styles.controls}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="queue">Revision Queue</option>

                <option value="due">Due Today</option>

                <option value="overdue">Overdue</option>

                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {sortedProblems.length === 0 ? (
            <div className={styles.emptyState}>
              No problems in this revision queue.
            </div>
          ) : (
            sortedProblems.map((problem) => (
              <article className={styles.queueItem} key={problem._id}>
                {/* TITLE */}

                <div className={styles.itemTop}>
                  <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                    {problem.title}
                  </a>

                  <span className={styles.stage}>Marked</span>
                </div>

                {/* META */}

                <div className={styles.metaRow}>
                  <span>{problem.platform}</span>

                  <span>•</span>

                  <span>{problem.topic}</span>

                  <span>•</span>

                  <span>{problem.difficulty}</span>
                </div>

                {/* DATES */}

                <div className={styles.datesRow}>
                  <div>
                    <p>Solved</p>

                    <span>
                      {new Date(problem.solvedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <p>Last Revised</p>

                    <span>Not tracked yet</span>
                  </div>

                  <div>
                    <p>Next Due</p>

                    <span>Not scheduled</span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className={styles.actionRow}>
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(problem._id)}
                  >
                    <i className={`bi bi-check2 ${styles.reviewIcon}`}></i>
                    Mark Reviewed
                  </button>

                  <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                    Open Problem →
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        {/* SIDE PANEL */}

        <aside className={styles.sidePanel}>
          <section className={styles.sideCard}>
            <p className={styles.sideTitle}>Revision Tips</p>

            <ul>
              <li>Try solving without looking at your previous solution.</li>

              <li>Identify the core pattern before writing code.</li>

              <li>Review your mistakes before marking it complete.</li>
            </ul>
          </section>

          <section className={styles.sideCard}>
            <p className={styles.sideTitle}>Queue Summary</p>

            <div className={styles.summaryRow}>
              <span>Marked for Revision</span>
              <span>{dueCount}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Overdue</span>
              <span>{overdueCount}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Upcoming</span>
              <span>{upcomingCount}</span>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default Revision;
