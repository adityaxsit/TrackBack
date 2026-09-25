const Collection = require("../models/Collection");


// GET ALL COLLECTIONS

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate("problemIds");

    res.status(200).json({
      collections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
};


// CREATE COLLECTION

const createCollection = async (req, res) => {
  try {
    const {
      name,
      description,
      problemIds,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Collection name is required",
      });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || "",
      type: "custom",
      problemIds: problemIds || [],
    });

    const populatedCollection =
      await collection.populate("problemIds");

    res.status(201).json({
      message: "Collection created successfully",
      collection: populatedCollection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create collection",
      error: error.message,
    });
  }
};


// UPDATE COLLECTION

const updateCollection = async (req, res) => {
  try {
    const collection =
      await Collection.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        },
      ).populate("problemIds");

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    res.status(200).json({
      message: "Collection updated successfully",
      collection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update collection",
      error: error.message,
    });
  }
};


// DELETE COLLECTION

const deleteCollection = async (req, res) => {
  try {
    const collection =
      await Collection.findByIdAndDelete(
        req.params.id,
      );

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    res.status(200).json({
      message: "Collection deleted successfully",
      collection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete collection",
      error: error.message,
    });
  }
};


module.exports = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
};