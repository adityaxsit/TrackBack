import { useRef, useState } from "react";
import useFetch from "../hooks/useFetch.js";
import styles from "./Patterns.module.css";

function Patterns() {
  const { data, loading, error } = useFetch("/api/problems");

  const [selectedPattern, setSelectedPattern] = useState(null);

  const patternDetailsRef = useRef(null);

  const handleViewPattern = (pattern) => {
    setSelectedPattern(pattern);

    setTimeout(() => {
      patternDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const problems = data?.problems ?? [];

  /*
    MongoDB stores topics like:

    "Array, Dynamic Programming, Matrix"

    Convert them into individual topics.
  */

  const topicMap = {};

  problems.forEach((problem) => {
    const topics = (problem.topic || "Uncategorized")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    topics.forEach((topic) => {
      if (!topicMap[topic]) {
        topicMap[topic] = [];
      }

      topicMap[topic].push(problem);
    });
  });

  /*
    Convert the topic map into the structure
    needed by the UI.
  */

  const patterns = Object.entries(topicMap)
    .map(([name, problemRefs], index) => ({
      id: index + 1,
      name,
      description: `Practice ${name} problems and strengthen your understanding of this topic.`,
      problemRefs,
    }))
    .sort((a, b) => b.problemRefs.length - a.problemRefs.length);

  return (
    <div className={styles.page}>
      {/* PAGE HEADER */}

      <div className={styles.pageHeader}>
        <div>
          <h1>Patterns</h1>

          <p>Learn and practice common DSA problem-solving patterns.</p>
        </div>
      </div>

      {/* PATTERN CARDS */}

      <section className={styles.patternGrid}>
        {patterns.map((pattern) => (
          <article className={styles.patternCard} key={pattern.id}>
            <h2>{pattern.name}</h2>

            <p>{pattern.description}</p>

            <div className={styles.cardFooter}>
              <span>{pattern.problemRefs.length} problems</span>

              <button
                className={styles.viewButton}
                onClick={() => handleViewPattern(pattern)}
              >
                View Pattern →
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* SELECTED PATTERN DETAILS */}

      {selectedPattern && (
        <section className={styles.patternDetails} ref={patternDetailsRef}>
          <div className={styles.detailsHeader}>
            <div>
              <h2>{selectedPattern.name}</h2>

              <p>{selectedPattern.description}</p>
            </div>

            <button
              className={styles.closeButton}
              onClick={() => setSelectedPattern(null)}
            >
              ← Back
            </button>
          </div>

          {/* PROBLEMS */}

          <div className={styles.problemList}>
            <h3>Problems</h3>

            {selectedPattern.problemRefs.map((problem) => (
              <div className={styles.problemRow} key={problem._id}>
                <a
                  href={problem.problemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.problemTitle}
                >
                  {problem.title} ↗
                </a>

                <span>{problem.platform}</span>

                <span
                  className={`${styles.difficulty} ${
                    styles[problem.difficulty?.toLowerCase()]
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Patterns;
