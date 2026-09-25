import useFetch from "../hooks/useFetch.js";
import styles from "./Analytics.module.css";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function Analytics() {
  const { data, loading, error } = useFetch("/api/problems");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const problems = data?.problems ?? [];

  // -------------------------
  // 1. TOTAL SOLVED
  // -------------------------

  const totalSolved = problems.length;

  // -------------------------
  // 2. SOLVED THIS WEEK
  // -------------------------

  const getSolvedThisWeek = () => {
    const today = new Date();

    const day = today.getDay();

    // Monday = 0, Tuesday = 1 ... Sunday = 6
    const differenceFromMonday = day === 0 ? 6 : day - 1;

    const monday = new Date(today);

    monday.setDate(today.getDate() - differenceFromMonday);

    monday.setHours(0, 0, 0, 0);

    return problems.filter((problem) => new Date(problem.solvedAt) >= monday)
      .length;
  };

  const solvedThisWeek = getSolvedThisWeek();

  // -------------------------
  // 3. CURRENT STREAK
  // -------------------------

  const getDateKey = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getSolvedDates = () => {
    return [
      ...new Set(
        problems.map((problem) => getDateKey(new Date(problem.solvedAt))),
      ),
    ].sort((a, b) => new Date(b) - new Date(a));
  };

  const calculateCurrentStreak = () => {
    const solvedDates = getSolvedDates();

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
  };

  const currentStreak = calculateCurrentStreak();

  // -------------------------
  // 4. REVISION
  // -------------------------

  // Current DB only stores revision: true/false
  const revisionDue = problems.filter(
    (problem) => problem.revision === true,
  ).length;

  // -------------------------
  // ANALYTICS CARDS
  // -------------------------

  const statsCards = [
    {
      id: 1,
      title: "Total Solved",
      value: totalSolved,
      subtitle: "All time",
    },
    {
      id: 2,
      title: "This Week",
      value: solvedThisWeek,
      subtitle: "Problems solved",
    },
    {
      id: 3,
      title: "Current Streak",
      value: `${currentStreak}`,
      subtitle: "days",
    },
    {
      id: 4,
      title: "Revision Due",
      value: revisionDue,
      subtitle: "Marked for revision",
    },
  ];

  // -------------------------
  // PROBLEMS BY TOPICS
  // -------------------------

  const topicCounts = {};

  problems.forEach((problem) => {
    const topics = (problem.topic || "Uncategorized")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    topics.forEach((topic) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  const topicData = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: totalSolved > 0 ? (count / totalSolved) * 100 : 0,
    }));

  // -------------------------
  // DIFFICULTY DISTRIBUTION
  // -------------------------

  const difficultyCounts = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };

  problems.forEach((problem) => {
    if (difficultyCounts[problem.difficulty] !== undefined) {
      difficultyCounts[problem.difficulty]++;
    }
  });

  const difficultyData = Object.entries(difficultyCounts).map(
    ([difficulty, count]) => ({
      difficulty,
      count,
    }),
  );

  // -------------------------
  // PLATFORM DISTRIBUTION
  // -------------------------

  const platformCounts = {};

  problems.forEach((problem) => {
    const platform = problem.platform || "Unknown";

    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  const platformData = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({
      platform,
      count,
      percentage: totalSolved > 0 ? (count / totalSolved) * 100 : 0,
    }));

  // -------------------------
  // COMPANY DISTRIBUTION
  // -------------------------

  const companyCounts = {};

  problems.forEach((problem) => {
    (problem.companies || []).forEach((company) => {
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });
  });

  const companyData = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({
      company,
      count,
      percentage: totalSolved > 0 ? (count / totalSolved) * 100 : 0,
    }));

  // -------------------------
  // HEATMAP DATA
  // -------------------------

  const dateCounts = {};

  problems.forEach((problem) => {
    const date = new Date(problem.solvedAt);

    const dateKey = getDateKey(date);

    dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
  });

  const generateCalendarDates = () => {
    const dates = [];

    const today = new Date();

    const startDate = new Date(today.getFullYear(), 0, 1);

    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      dates.push(getDateKey(currentDate));

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const calendarDates = generateCalendarDates();

  const weeks = [];

  let currentWeek = [];

  calendarDates.forEach((dateKey) => {
    const date = new Date(dateKey);

    const day = date.getDay();

    // Convert so Monday = 0
    const mondayIndex = day === 0 ? 6 : day - 1;

    // Add empty cells before
    // the first day of the year
    if (weeks.length === 0 && currentWeek.length === 0) {
      for (let i = 0; i < mondayIndex; i++) {
        currentWeek.push(null);
      }
    }

    currentWeek.push(dateKey);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }

    weeks.push(currentWeek);
  }

  const getHeatLevel = (dateKey) => {
    const count = dateCounts[dateKey] || 0;

    if (count === 0) {
      return "level0";
    }

    if (count === 1) {
      return "level1";
    }

    if (count === 2) {
      return "level2";
    }

    return "level3";
  };

  const getMonthLabel = (dateKey) => {
    const date = new Date(dateKey);

    return date.toLocaleString("en-US", {
      month: "short",
    });
  };

  const monthLabels = [];

  weeks.forEach((week, weekIndex) => {
    const firstDate = week.find((date) => date !== null);

    if (!firstDate) {
      return;
    }

    const month = new Date(firstDate).getMonth();

    if (
      weekIndex === 0 ||
      new Date(
        weeks[weekIndex - 1].find((date) => date !== null),
      ).getMonth() !== month
    ) {
      monthLabels.push({
        weekIndex,
        label: getMonthLabel(firstDate),
      });
    }
  });

  return (
    <div className={styles.analyticsPage}>
      {/* PAGE HEADING */}

      <section className={styles.header}>
        <h1>Analytics</h1>

        <p>
          Track your coding progress across time, platforms, topics, and
          consistency.
        </p>
      </section>

      {/* FOUR SUMMARY CARDS */}

      <section className={styles.statsGrid}>
        {statsCards.map((stat) => (
          <article className={styles.statCard} key={stat.id}>
            <p className={styles.statTitle}>{stat.title}</p>

            <h2 className={styles.statValue}>{stat.value}</h2>

            <p className={styles.statSubtitle}>{stat.subtitle}</p>
          </article>
        ))}
      </section>

      <section className={styles.analyticsGrid}>
        {/* TOPICS */}

        <section className={styles.analyticsCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Problems By Topics</p>

            <span className={styles.cardSubtext}>
              Distribution of solved problems
            </span>
          </div>

          <div className={styles.topicList}>
            {topicData.map((item) => (
              <div className={styles.topicItem} key={item.topic}>
                <div className={styles.topicInfo}>
                  <span>{item.topic}</span>

                  <span>{Math.round(item.percentage)}%</span>
                </div>

                <div className={styles.topicBar}>
                  <div
                    className={styles.topicFill}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIFFICULTY */}

        <section className={styles.analyticsCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Difficulty Distribution</p>

            <span className={styles.cardSubtext}>
              Problems solved by difficulty
            </span>
          </div>

          <div className={styles.difficultyContent}>
            <div className={styles.difficultyChart}>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    dataKey="count"
                    nameKey="difficulty"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {difficultyData.map((entry) => (
                      <Cell
                        key={entry.difficulty}
                        fill={
                          entry.difficulty === "Easy"
                            ? "#65b891"
                            : entry.difficulty === "Medium"
                              ? "#d6a84f"
                              : "#d95c4a"
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className={styles.difficultyCenter}>
                <strong>{totalSolved}</strong>

                <span>Solved</span>
              </div>
            </div>

            <div className={styles.difficultyLegend}>
              {difficultyData.map((item) => (
                <div className={styles.legendItem} key={item.difficulty}>
                  <span
                    className={`${styles.legendDot} ${
                      styles[item.difficulty.toLowerCase()]
                    }`}
                  />

                  <span>{item.difficulty}</span>

                  <strong>
                    {item.count} (
                    {totalSolved > 0
                      ? Math.round((item.count / totalSolved) * 100)
                      : 0}
                    %)
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {/* PLATFORM + COMPANY */}

      <section className={styles.analyticsGrid}>
        {/* PLATFORM */}

        <section className={styles.analyticsCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Platform Distribution</p>

            <span className={styles.cardSubtext}>
              Problems solved across platforms
            </span>
          </div>

          <div className={styles.platformList}>
            {platformData.map((item) => (
              <div className={styles.platformItem} key={item.platform}>
                <div className={styles.platformInfo}>
                  <span>{item.platform}</span>

                  <span>{Math.round(item.percentage)}%</span>
                </div>

                <div className={styles.platformBar}>
                  <div
                    className={styles.platformFill}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPANIES */}

        <section className={styles.analyticsCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Top Companies Practiced</p>

            <span className={styles.cardSubtext}>
              Companies across solved problems
            </span>
          </div>

          <div className={styles.platformList}>
            {companyData.map((item) => (
              <div className={styles.platformItem} key={item.company}>
                <div className={styles.platformInfo}>
                  <span>{item.company}</span>

                  <span>{Math.round(item.percentage)}%</span>
                </div>

                <div className={styles.platformBar}>
                  <div
                    className={styles.platformFill}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* SOLVING ACTIVITY / HEATMAP */}

      <section className={styles.heatmapCard}>
        <div className={styles.cardHeader}>
          <p className={styles.cardLabel}>Solving Activity</p>

          <span className={styles.cardSubtext}>
            Problems solved throughout the year
          </span>
        </div>

        <div className={styles.heatmapWrapper}>
          <div className={styles.dayLabels}>
            <span>Mon</span>
            <span></span>
            <span>Wed</span>
            <span></span>
            <span>Fri</span>
            <span></span>
            <span>Sun</span>
          </div>

          <div className={styles.heatmapContent}>
            <div className={styles.monthLabels}>
              {weeks.map((_, weekIndex) => {
                const month = monthLabels.find(
                  (item) => item.weekIndex === weekIndex,
                );

                return <span key={weekIndex}>{month?.label || ""}</span>;
              })}
            </div>

            <div className={styles.heatmap}>
              {weeks.map((week, weekIndex) => (
                <div className={styles.heatmapWeek} key={weekIndex}>
                  {week.map((dateKey, dayIndex) => {
                    if (!dateKey) {
                      return (
                        <div
                          className={styles.heatmapCellEmpty}
                          key={dayIndex}
                        />
                      );
                    }

                    const count = dateCounts[dateKey] || 0;

                    return (
                      <div
                        className={`${styles.heatmapCell} ${
                          styles[getHeatLevel(dateKey)]
                        }`}
                        key={dateKey}
                        title={`${count} ${
                          count === 1 ? "problem" : "problems"
                        } solved on ${dateKey}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heatmapLegend}>
          <span>Less</span>

          <span className={`${styles.legendCell} ${styles.level0}`} />

          <span className={`${styles.legendCell} ${styles.level1}`} />

          <span className={`${styles.legendCell} ${styles.level2}`} />

          <span className={`${styles.legendCell} ${styles.level3}`} />

          <span>More</span>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
