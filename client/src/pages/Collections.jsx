import { useEffect, useRef, useState } from "react";

import styles from "./Collections.module.css";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollection, setSelectedCollection] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [collectionName, setCollectionName] = useState("");

  const [collectionDescription, setCollectionDescription] = useState("");

  const [selectedProblemIds, setSelectedProblemIds] = useState([]);

  const [editingCollectionId, setEditingCollectionId] = useState(null);

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

  // VIEW COLLECTION

  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);

    setTimeout(() => {
      collectionDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  // SELECT / UNSELECT PROBLEM

  const handleProblemSelection = (problemId) => {
    setSelectedProblemIds((prev) => {
      if (prev.includes(problemId)) {
        return prev.filter((id) => id !== problemId);
      }

      return [...prev, problemId];
    });
  };

  // OPEN CREATE FORM

  const handleOpenCreateForm = () => {
    setEditingCollectionId(null);
    setCollectionName("");
    setCollectionDescription("");
    setSelectedProblemIds([]);
    setShowCreateForm(true);
  };

  // OPEN EDIT FORM

  const handleEditCollection = (collection) => {
    setEditingCollectionId(collection.id);

    setCollectionName(collection.name);

    setCollectionDescription(collection.description);

    setSelectedProblemIds([...collection.problemIds]);

    setShowCreateForm(true);
  };

  // CREATE / UPDATE COLLECTION

  const handleSaveCollection = () => {
    if (!collectionName.trim()) {
      return;
    }

    // EDIT EXISTING COLLECTION

    if (editingCollectionId !== null) {
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === editingCollectionId
            ? {
                ...collection,
                name: collectionName.trim(),
                description: collectionDescription.trim(),
                problemIds: selectedProblemIds,
              }
            : collection,
        ),
      );

      // Also update currently opened collection
      if (selectedCollection && selectedCollection.id === editingCollectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          name: collectionName.trim(),
          description: collectionDescription.trim(),
          problemIds: selectedProblemIds,
        }));
      }
    }

    // CREATE NEW COLLECTION
    else {
      const newCollection = {
        id: Date.now(),
        name: collectionName.trim(),
        description: collectionDescription.trim(),
        type: "custom",
        problemIds: selectedProblemIds,
      };

      setCollections((prev) => [...prev, newCollection]);
    }

    // RESET FORM

    setCollectionName("");
    setCollectionDescription("");
    setSelectedProblemIds([]);
    setEditingCollectionId(null);
    setShowCreateForm(false);
  };

  // DELETE COLLECTION

  const handleDeleteCollection = (collectionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collection?",
    );

    if (!confirmed) {
      return;
    }

    setCollections((prev) =>
      prev.filter((collection) => collection.id !== collectionId),
    );

    // Close collection if it is currently open
    if (selectedCollection && selectedCollection.id === collectionId) {
      setSelectedCollection(null);
    }

    // Close edit form if this collection was being edited
    if (editingCollectionId === collectionId) {
      setEditingCollectionId(null);
      setShowCreateForm(false);
    }
  };

  // CANCEL FORM

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingCollectionId(null);
    setCollectionName("");
    setCollectionDescription("");
    setSelectedProblemIds([]);
  };

  return (
    <div className={styles.page}>
      {/* PAGE HEADER */}

      <div className={styles.pageHeader}>
        <div>
          <h1>Collections</h1>

          <p>Organize problems into focused practice sets.</p>
        </div>

        <button className={styles.createButton} onClick={handleOpenCreateForm}>
          + Create Collection
        </button>
      </div>

      {/* CREATE / EDIT FORM */}

      {showCreateForm && (
        <section className={styles.createForm}>
          <h2>
            {editingCollectionId !== null
              ? "Edit Collection"
              : "Create Collection"}
          </h2>

          {/* NAME */}

          <div className={styles.formGroup}>
            <label htmlFor="collectionName">Collection Name</label>

            <input
              id="collectionName"
              type="text"
              placeholder="e.g. Placement Must Do"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}

          <div className={styles.formGroup}>
            <label htmlFor="collectionDescription">Description</label>

            <textarea
              id="collectionDescription"
              placeholder="What is this collection for?"
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
            />
          </div>

          {/* PROBLEM SELECTION */}

          <div className={styles.problemSelection}>
            <h3>Select Problems ({selectedProblemIds.length})</h3>

            <div className={styles.problemSelectionList}>
              {problems.map((problem) => (
                <label className={styles.problemOption} key={problem.id}>
                  <input
                    type="checkbox"
                    checked={selectedProblemIds.includes(problem.id)}
                    onChange={() => handleProblemSelection(problem.id)}
                  />

                  <span className={styles.problemOptionTitle}>
                    {problem.title}
                  </span>

                  <span>{problem.difficulty}</span>

                  <span>{problem.topic}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div className={styles.formActions}>
            <button className={styles.cancelButton} onClick={handleCancelForm}>
              Cancel
            </button>

            <button
              className={styles.createButton}
              onClick={handleSaveCollection}
            >
              {editingCollectionId !== null
                ? "Save Changes"
                : "Create Collection"}
            </button>
          </div>
        </section>
      )}

      {/* COLLECTION CARDS */}

      <section className={styles.collectionsGrid}>
        {collections.map((collection) => {
          const collectionProblems = getCollectionProblems(collection);

          return (
            <div className={styles.collectionCard} key={collection.id}>
              <h2>{collection.name}</h2>

              <p>{collection.description}</p>

              <span>{collectionProblems.length} problems</span>

              {/* CARD ACTIONS */}

              <div className={styles.cardActions}>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewCollection(collection)}
                >
                  View Collection →
                </button>

                <button
                  className={styles.editButton}
                  onClick={() => handleEditCollection(collection)}
                >
                  Edit
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteCollection(collection.id)}
                >
                  Delete
                </button>
              </div>
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

          {/* PROBLEM LIST */}

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
