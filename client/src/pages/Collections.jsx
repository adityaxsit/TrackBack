import { useEffect, useState, useRef } from "react";
import styles from "./Collections.module.css";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const collectionDetailsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/collections.json").then((response) => response.json()),
      fetch("/data/problems.json").then((response) => response.json()),
    ]).then(([collectionsData, problemsData]) => {
      setCollections(collectionsData.collections);
      setProblems(problemsData.problems);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const getCollectionProblems = (collection) => {
    return collection.problemIds
      .map((problemId) => problems.find((problem) => problem.id === problemId))
      .filter(Boolean);
  };
  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);

    setTimeout(() => {
      collectionDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <div className={styles.page}>
      {/* PAGE HEADER */}

      <h1>Collections</h1>

      <p>Organize problems into focused practice sets.</p>

      {/* COLLECTION CARDS */}

      <section className={styles.collectionsGrid}>
        {collections.map((collection) => {
          const collectionProblems = getCollectionProblems(collection);

          return (
            <div className={styles.collectionCard} key={collection.id}>
              <h2>{collection.name}</h2>

              <p>{collection.description}</p>

              
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewCollection(collection)}
                >
                  {collectionProblems.length} problems
                </button>
              
            </div>
          );
        })}
      </section>

      {/* SELECTED COLLECTION */}

      {selectedCollection && (
        <section
          className={styles.collectionDetails}
          ref={collectionDetailsRef}
        >
          <div className={styles.detailsHeader}>
            <div>
              <h2>{selectedCollection.name}</h2>

              <p>{selectedCollection.description}</p>
            </div>

            <button
              className={styles.closeButton}
              onClick={() => setSelectedCollection(null)}
            >
              ← Back
            </button>
          </div>

          {/* PROBLEMS INSIDE COLLECTION */}

          <div className={styles.problemList}>
            {getCollectionProblems(selectedCollection).map((problem) => (
              <div className={styles.problemRow} key={problem.id}>
                <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                  {problem.title} ↗
                </a>

                <span>{problem.topic}</span>

                <span>{problem.difficulty}</span>

                <span>{problem.platform}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Collections;
