import { useEffect, useRef, useState } from "react";
import styles from "./Patterns.module.css";

function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);

  const patternDetailsRef = useRef(null);

  useEffect(() => {
    fetch("/data/patterns.json")
      .then((response) => response.json())
      .then((data) => {
        setPatterns(data.patterns);
        setLoading(false);
      });
  }, []);

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

  return (
    <div className={styles.page}>

      {/* PAGE HEADER */}

      <div className={styles.pageHeader}>
        <div>
          <h1>Patterns</h1>

          <p>
            Learn and practice common DSA
            problem-solving patterns.
          </p>
        </div>
      </div>


      {/* PATTERN CARDS */}

      <section className={styles.patternGrid}>
        {patterns.map((pattern) => (
          <article
            className={styles.patternCard}
            key={pattern.id}
          >
            <h2>{pattern.name}</h2>

            <p>{pattern.description}</p>

            <div className={styles.cardFooter}>
              <span>
                {pattern.problemRefs.length} problems
              </span>

              <button
                className={styles.viewButton}
                onClick={() =>
                  handleViewPattern(pattern)
                }
              >
                View Pattern →
              </button>
            </div>
          </article>
        ))}
      </section>


      {/* SELECTED PATTERN DETAILS */}

      {selectedPattern && (
        <section
          className={styles.patternDetails}
          ref={patternDetailsRef}
        >

          <div className={styles.detailsHeader}>

            <div>
              <h2>{selectedPattern.name}</h2>

              <p>
                {selectedPattern.description}
              </p>
            </div>

            <button
              className={styles.closeButton}
              onClick={() =>
                setSelectedPattern(null)
              }
            >
              ← Back
            </button>

          </div>


          {/* PROBLEMS */}

          <div className={styles.problemList}>
            <h3>Problems</h3>

            {selectedPattern.problemRefs.map(
              (problem, index) => (
                <div
                  className={styles.problemRow}
                  key={`${problem.title}-${index}`}
                >

                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.problemTitle}
                  >
                    {problem.title} ↗
                  </a>

                  <span>
                    {problem.platform}
                  </span>

                  <span
                    className={`${styles.difficulty} ${
                      styles[
                        problem.difficulty.toLowerCase()
                      ]
                    }`}
                  >
                    {problem.difficulty}
                  </span>

                </div>
              )
            )}
          </div>


          {/* EXTERNAL REFERENCE */}

          {selectedPattern.externalReference && (
            <a
              href={selectedPattern.externalReference}
              target="_blank"
              rel="noreferrer"
              className={styles.externalReference}
            >
              Learn more about this pattern ↗
            </a>
          )}

        </section>
      )}

    </div>
  );
}

export default Patterns;