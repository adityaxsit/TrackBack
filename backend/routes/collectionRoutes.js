const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");

const router = express.Router();

router.get("/", authMiddleware, getCollections);

router.post("/", authMiddleware, createCollection);

router.patch("/:id", authMiddleware, updateCollection);

router.delete("/:id", authMiddleware, deleteCollection);

module.exports = router;