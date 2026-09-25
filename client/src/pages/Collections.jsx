import { useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch.js";
import styles from "./Collections.module.css";

function Collections() {
  const { data, loading, error } = useFetch("/api/collections");

  const [collections, setCollections] = useState([]);

  const [selectedCollection, setSelectedCollection] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [collectionName, setCollectionName] = useState("");

  const [collectionDescription, setCollectionDescription] = useState("");

  const [selectedProblemIds, setSelectedProblemIds] = useState([]);

  const [editingCollectionId, setEditingCollectionId] = useState(null);

  const [problems, setProblems] = useState([]);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const collectionDetailsRef = useRef(null);

  /*
   * Load collections from MongoDB
   */
  useEffect(() => {
    if (data) {
      setCollections(data.collections || []);
    }
  }, [data]);

  /*
   * Load problems from MongoDB.
   *
   * Collections API gives populated problems,
   * but we need the complete problem list when
   * creating/editing a collection.
   */
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch("/api/problems");

        if (!response.ok) {
          throw new Error("Failed to fetch problems");
        }

        const data = await response.json();

        setProblems(data.problems || []);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  /*
   * VIEW COLLECTION
   */
  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);

    setTimeout(() => {
      collectionDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  /*
   * SELECT / UNSELECT PROBLEM
   */
  const handleProblemSelection = (problemId) => {
    setSelectedProblemIds((previousIds) => {
      if (previousIds.includes(problemId)) {
        return previousIds.filter((id) => id !== problemId);
      }

      return [...previousIds, problemId];
    });
  };

  /*
   * OPEN CREATE FORM
   */
  const handleOpenCreateForm = () => {
    setEditingCollectionId(null);

    setCollectionName("");

    setCollectionDescription("");

    setSelectedProblemIds([]);

    setMessage("");

    setShowCreateForm(true);
  };

  /*
   * OPEN EDIT FORM
   */
  const handleEditCollection = (collection) => {
    setEditingCollectionId(collection._id);

    setCollectionName(collection.name);

    setCollectionDescription(collection.description || "");

    /*
     * collection.problemIds contains
     * populated Problem objects.
     *
     * We only need their _id values
     * when sending PATCH.
     */
    setSelectedProblemIds(collection.problemIds.map((problem) => problem._id));

    setMessage("");

    setShowCreateForm(true);
  };

  /*
   * CREATE / UPDATE COLLECTION
   */
  const handleSaveCollection = async () => {
    if (!collectionName.trim()) {
      setMessage("Collection name is required.");

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      /*
       * UPDATE
       */
      if (editingCollectionId) {
        const response = await fetch(
          `/api/collections/${editingCollectionId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: collectionName.trim(),
              description: collectionDescription.trim(),
              problemIds: selectedProblemIds,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update collection");
        }

        const data = await response.json();

        /*
         * Update collection in React state
         */
        setCollections((previousCollections) =>
          previousCollections.map((collection) =>
            collection._id === editingCollectionId
              ? data.collection
              : collection,
          ),
        );

        /*
         * Update currently opened collection
         */
        if (selectedCollection?._id === editingCollectionId) {
          setSelectedCollection(data.collection);
        }

        setMessage("Collection updated successfully.");
      } else {

      /*
       * CREATE
       */
        const response = await fetch("/api/collections", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: collectionName.trim(),
            description: collectionDescription.trim(),
            problemIds: selectedProblemIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create collection");
        }

        const data = await response.json();

        setCollections((previousCollections) => [
          ...previousCollections,
          data.collection,
        ]);

        setMessage("Collection created successfully.");
      }

      /*
       * RESET FORM
       */
      setCollectionName("");

      setCollectionDescription("");

      setSelectedProblemIds([]);

      setEditingCollectionId(null);

      setShowCreateForm(false);
    } catch (error) {
      console.error("Collection save failed:", error);

      setMessage("Failed to save collection.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * DELETE COLLECTION
   */
  const handleDeleteCollection = async (collectionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collection?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete collection");
      }

      setCollections((previousCollections) =>
        previousCollections.filter(
          (collection) => collection._id !== collectionId,
        ),
      );

      /*
       * Close collection if currently open
       */
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection(null);
      }

      /*
       * Close edit form if necessary
       */
      if (editingCollectionId === collectionId) {
        setEditingCollectionId(null);

        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Delete collection failed:", error);
    }
  };

  /*
   * CANCEL FORM
   */
  const handleCancelForm = () => {
    setShowCreateForm(false);

    setEditingCollectionId(null);

    setCollectionName("");

    setCollectionDescription("");

    setSelectedProblemIds([]);

    setMessage("");
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
            {editingCollectionId ? "Edit Collection" : "Create Collection"}
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
                <label className={styles.problemOption} key={problem._id}>
                  <input
                    type="checkbox"
                    checked={selectedProblemIds.includes(problem._id)}
                    onChange={() => handleProblemSelection(problem._id)}
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

          {/* MESSAGE */}

          {message && <p>{message}</p>}

          {/* FORM ACTIONS */}

          <div className={styles.formActions}>
            <button
              className={styles.cancelButton}
              onClick={handleCancelForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className={styles.createButton}
              onClick={handleSaveCollection}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingCollectionId
                  ? "Save Changes"
                  : "Create Collection"}
            </button>
          </div>
        </section>
      )}

      {/* COLLECTION CARDS */}

      <section className={styles.collectionsGrid}>
        {collections.length === 0 ? (
          <p>No collections created yet.</p>
        ) : (
          collections.map((collection) => {
            const collectionProblems = collection.problemIds || [];

            return (
              <div className={styles.collectionCard} key={collection._id}>
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
                    onClick={() => handleDeleteCollection(collection._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
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
            {(selectedCollection.problemIds || []).map((problem) => (
              <div className={styles.problemRow} key={problem._id}>
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
