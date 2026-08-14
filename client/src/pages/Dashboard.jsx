import styles from "./Dashboard.module.css";
import useFetch from "../hooks/useFetch.js";
import { Link } from "react-router-dom";
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const WEEKLY_GOAL = 25;

const dailyQuote = {
  text: "Discipline is choosing between what you want now and what you want most.",
  author: "Abraham Lincoln",
};

// Convert a Date into YYYY-MM-DD using local time
function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Get unique solved dates
function getSolvedDates(problems) {
  return [
    ...new Set(
      problems.map((problem) => getDateKey(new Date(problem.solvedAt))),
    ),
  ].sort((a, b) => new Date(b) - new Date(a));
}

// Current streak
function calculateCurrentStreak(problems) {
  const solvedDates = getSolvedDates(problems);

  if (solvedDates.length === 0) {
    return 0;
  }

  const today = new Date();
  let currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  let streak = 0;

  for (const solvedDate of solvedDates) {
    const expectedDate = getDateKey(currentDate);

    if (solvedDate !== expectedDate) {
      break;
    }

    streak++;

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

// Best streak
function calculateBestStreak(problems) {
  const solvedDates = getSolvedDates(problems)
    .map((date) => new Date(`${date}T00:00:00`))
    .sort((a, b) => a - b);

  if (solvedDates.length === 0) {
    return 0;
  }

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < solvedDates.length; i++) {
    const previous = solvedDates[i - 1];
    const current = solvedDates[i];

    const difference = (current - previous) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return bestStreak;
}

// Problems solved from Monday until today
function getSolvedThisWeek(problems) {
  const today = new Date();

  const day = today.getDay();

  const differenceFromMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - differenceFromMonday);
  monday.setHours(0, 0, 0, 0);

  return problems.filter((problem) => new Date(problem.solvedAt) >= monday)
    .length;
}

// Revision due today or overdue
function getRevisionDue(revisions) {
  const today = new Date();

  today.setHours(23, 59, 59, 999);

  return revisions.filter((revision) => {
    if (revision.revisionStage <= 0 || !revision.nextRevisionAt) {
      return false;
    }

    return new Date(revision.nextRevisionAt) <= today;
  }).length;
}

// Get revision topics that need attention
function getRevisionTopics(problems, revisions) {
  const today = new Date();

  today.setHours(23, 59, 59, 999);

  const topicCounts = {};

  revisions.forEach((revision) => {
    if (revision.revisionStage <= 0 || !revision.nextRevisionAt) {
      return;
    }

    const dueDate = new Date(revision.nextRevisionAt);

    if (dueDate > today) {
      return;
    }

    const problem = problems.find(
      (problem) => problem.id === revision.problemId,
    );

    if (!problem) {
      return;
    }

    topicCounts[problem.topic] = (topicCounts[problem.topic] || 0) + 1;
  });

  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic, due], index) => ({
      id: index + 1,
      topic,
      due,
    }));
}

// Company frequency
function getCompanyProgress(problems) {
  const companyCounts = {};

  problems.forEach((problem) => {
    problem.companies.forEach((company) => {
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });
  });

  return Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, solved], index) => ({
      id: index + 1,
      company,
      solved,
    }));
}

function Dashboard() {
  const problemsFetch = useFetch("/data/problems.json");
  const revisionsFetch = useFetch("/data/revision.json");
  
  const loading=  problemsFetch.loading || revisionsFetch.loading;
  const error= problemsFetch.error || revisionsFetch.error;

  

  if (loading) {
    return <LoadingSpinner />;
  }
  if(error){
    return <p>Error:{error}</p>
  }

  const problems = problemsFetch.data.problems;
  const revisions = revisionsFetch.data.revisions;
    

  // -------------------------
  // DERIVED DASHBOARD DATA
  // -------------------------

  const totalSolved = problems.length;

  const solvedThisWeek = getSolvedThisWeek(problems);

  const currentStreak = calculateCurrentStreak(problems);

  const bestStreak = calculateBestStreak(problems);

  const revisionDue = getRevisionDue(revisions);

  const weeklySolved = solvedThisWeek;

  // Latest solved problem = Continue Where You Left Off
  const recentProblems = [...problems]
    .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
    .slice(0, 5);

  const continueProblem = recentProblems[0];

  const revisionTopics = getRevisionTopics(problems, revisions);

  const companyProgress = getCompanyProgress(problems);

  // -------------------------
  // MILESTONES
  // -------------------------

  const milestones = [
    {
      id: 1,
      title: "Problems Solved",
      current: totalSolved,
      target: 100,
    },
    {
      id: 2,
      title: "Streak",
      current: currentStreak,
      target: 30,
    },
  ];

  // -------------------------
  // STAT CARDS
  // -------------------------

  const statsCards = [
    {
      id: 1,
      title: "Problems Solved",
      value: totalSolved,
      info: `+${solvedThisWeek} this week`,
    },
    {
      id: 2,
      title: "Current Streak",
      value: `${currentStreak} days`,
      info: `Best: ${bestStreak} days`,
    },
    {
      id: 3,
      title: "Due for Revision",
      value: revisionDue,
      action: {
        label: "Start revising",
        path: "/revision",
      },
    },
    {
      id: 4,
      title: "Weekly Goal",
      value: `${weeklySolved} / ${WEEKLY_GOAL}`,
      info: `${Math.min(
        Math.round((weeklySolved / WEEKLY_GOAL) * 100),
        100,
      )}% complete`,
    },
  ];

  return (
    <div className={styles.dashboardPage}>
      <section className={styles.header}>
        <h1>Welcome back, Aditya 👋</h1>
        <p>Here's where you stand.</p>
      </section>

      {/* STATS */}

      <section className={styles.statsGrid}>
        {statsCards.map((stat) => (
          <div className={styles.statCard} key={stat.id}>
            <p className={styles.statTitle}>{stat.title}</p>

            <h2>
              {stat.value}

              {stat.suffix && (
                <span className={styles.suffix}> {stat.suffix}</span>
              )}
            </h2>

            {stat.info && <p className={styles.statInfo}>{stat.info}</p>}

            {stat.action && (
              <Link to={stat.action.path} className={styles.statAction}>
                {stat.action.label} →
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* CONTINUE + REVISION */}

      <section className={styles.progressGrid}>
        {continueProblem && (
          <div className={styles.dashboardCard}>
            <p className={styles.cardLabel}>Continue Where You Left Off</p>

            <div className={styles.problemContent}>
              <h2>{continueProblem.title}</h2>

              <p className={styles.problemMeta}>
                {continueProblem.topic}
                <span>•</span>
                {continueProblem.difficulty}
              </p>

              <p className={styles.lastWorked}>
                Solved on{" "}
                {new Date(continueProblem.solvedAt).toLocaleDateString()}
              </p>
            </div>

            <a
              href={continueProblem.problemUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.resumeButton}
            >
              Resume →
            </a>
          </div>
        )}

        <div className={styles.dashboardCard}>
          <p className={styles.cardLabel}>Revision Focus</p>

          <h2 className={styles.revisionHeading}>Topics needing attention</h2>

          <div className={styles.revisionList}>
            {revisionTopics.length > 0 ? (
              revisionTopics.map((item) => (
                <div className={styles.revisionItem} key={item.id}>
                  <span>{item.topic}</span>

                  <span className={styles.dueCount}>{item.due} due</span>
                </div>
              ))
            ) : (
              <p>No revisions due 🎉</p>
            )}
          </div>
        </div>
      </section>

      {/* MILESTONES + COMPANIES */}

      <section className={styles.insightsGrid}>
        <div className={styles.dashboardCard}>
          <p className={styles.cardLabel}>Next Milestones</p>

          <div className={styles.milestoneList}>
            {milestones.map((milestone) => {
              const progress = Math.min(
                (milestone.current / milestone.target) * 100,
                100,
              );

              return (
                <div className={styles.milestoneItem} key={milestone.id}>
                  <div className={styles.milestoneInfo}>
                    <span>{milestone.title}</span>

                    <span>
                      {milestone.current} / {milestone.target}
                    </span>
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.dashboardCard}>
          <p className={styles.cardLabel}>Top Companies Practiced</p>

          <div className={styles.companyList}>
            {companyProgress.map((company) => (
              <div className={styles.companyItem} key={company.id}>
                <span>{company.company}</span>

                <span className={styles.companySolved}>
                  {company.solved} solved
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT PROBLEMS */}

      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.cardLabel}>Recent Solved Problems</p>

          <Link to="/problems" className={styles.viewAll}>
            View all →
          </Link>
        </div>

        <div className={styles.problemTable}>
          <div className={styles.tableHeader}>
            <span>Problem</span>
            <span>Topic</span>
            <span>Difficulty</span>
            <span>Solved</span>
          </div>

          {recentProblems.map((problem) => (
            <div className={styles.problemRow} key={problem.id}>
              <a
                className={styles.problemTitle}
                href={problem.problemUrl}
                target="_blank"
                rel="noreferrer"
              >
                {problem.title}↗
              </a>

              <span>{problem.topic}</span>

              <span>{problem.difficulty}</span>

              <span>{new Date(problem.solvedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY QUOTE */}

      <section className={styles.quoteSection}>
        <p className={styles.quoteText}>“{dailyQuote.text}”</p>

        <span className={styles.quoteAuthor}>— {dailyQuote.author}</span>
      </section>
    </div>
  );
}

export default Dashboard;
