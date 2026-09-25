const express = require("express");

const {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");

const router = express.Router();

router.get("/", getCollections);

router.post("/", createCollection);

router.patch("/:id", updateCollection);

router.delete("/:id", deleteCollection);

module.exports = router;