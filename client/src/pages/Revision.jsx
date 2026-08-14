import useFetch from "../hooks/useFetch.js";
import { useEffect, useState } from "react";
import styles from "./Revision.module.css";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function Revision() {
  const problemsFetch = useFetch("/data/problems.json");
  const revisionsFetch = useFetch("/data/revision.json");
  
  const loading = problemsFetch.loading || revisionsFetch.loading;
  const error = problemsFetch.error || revisionsFetch.error;
  const [status, setStatus] = useState("queue");

  const problems = problemsFetch.data ? problemsFetch.data.problems : [];
 
  const [revisions, setRevisions] = useState([]);
  
  useEffect(() => {   
    if (revisionsFetch.data) {
      setRevisions(revisionsFetch.data.revisions);
    }
  }, [revisionsFetch.data]);

  if (loading) {
  return <LoadingSpinner />;
}
if (error) {
  return <p>Error: {error}</p>;
}

  //mark reviewed

  const handleMarkReviewed = (revisionId) => {
    setRevisions((previousRevisions) =>
      previousRevisions.map((revision) => {
        if (revision.id !== revisionId) {
          return revision;
        }

        const today = new Date();

        const nextRevision = new Date(today);

        nextRevision.setDate(
          nextRevision.getDate() + revision.revisionStage * 3,
        );

        return {
          ...revision,
          revisionStage: revision.revisionStage + 1,
          lastRevisedAt: today.toISOString(),
          nextRevisionAt: nextRevision.toISOString(),
        };
      }),
    );
  };

  // CONNECT PROBLEM DATA WITH REVISION DATA
  const revisionProblems = revisions
    .filter((revision) => revision.revisionStage > 0)
    .map((revision) => {
      const problem = problems.find(
        (problem) => problem.id === revision.problemId,
      );

      if (!problem) {
        return null;
      }

      return {
        ...problem,

        revisionId: revision.id,
        revisionStage: revision.revisionStage,
        lastRevisedAt: revision.lastRevisedAt,
        nextRevisionAt: revision.nextRevisionAt,
      };
    })
    .filter(Boolean);

  // GET REVISION STATUS FROM DATE
  const getRevisionStatus = (problem) => {
    if (!problem.nextRevisionAt) {
      return "unscheduled";
    }

    const today = new Date();
    const dueDate = new Date(problem.nextRevisionAt);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const revisionDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
    );

    if (revisionDate < todayDate) {
      return "overdue";
    }

    if (revisionDate.getTime() === todayDate.getTime()) {
      return "due";
    }

    return "upcoming";
  };

  // ADD DERIVED STATUS TO EACH PROBLEM
  const problemsWithStatus = revisionProblems.map((problem) => ({
    ...problem,
    revisionStatus: getRevisionStatus(problem),
  }));

  // COUNTS
  const dueCount = problemsWithStatus.filter(
    (problem) => problem.revisionStatus === "due",
  ).length;

  const overdueCount = problemsWithStatus.filter(
    (problem) => problem.revisionStatus === "overdue",
  ).length;

  const upcomingCount = problemsWithStatus.filter(
    (problem) => problem.revisionStatus === "upcoming",
  ).length;

  // FILTER QUEUE
  const filteredProblems = problemsWithStatus.filter((problem) => {
    if (status === "queue") {
      return (
        problem.revisionStatus === "due" || problem.revisionStatus === "overdue"
      );
    }

    return problem.revisionStatus === status;
  });

  // SORT MOST URGENT FIRST
  const sortedProblems = [...filteredProblems].sort(
    (a, b) => new Date(a.nextRevisionAt) - new Date(b.nextRevisionAt),
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
          <p>Due Today</p>
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
          <p>Total Scheduled</p>
          <h2>{problemsWithStatus.length}</h2>
        </article>
      </section>

      {/* FILTER */}

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
                <option value="queue">Today's Queue</option>
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
              <article className={styles.queueItem} key={problem.id}>
                {/* TITLE */}

                <div className={styles.itemTop}>
                  <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                    {problem.title}
                  </a>

                  <span className={styles.stage}>
                    Stage {problem.revisionStage}
                  </span>
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

                    <span>
                      {problem.lastRevisedAt
                        ? new Date(problem.lastRevisedAt).toLocaleDateString()
                        : "Not yet"}
                    </span>
                  </div>

                  <div>
                    <p>Next Due</p>

                    <span>
                      {new Date(problem.nextRevisionAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className={styles.actionRow}>
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(problem.revisionId)}
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
              <span>Due Today</span>
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
