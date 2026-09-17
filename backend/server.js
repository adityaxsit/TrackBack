const express = require("express");
const connectDB = require("./connect");

const problemRoutes = require("./routes/problemRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");

const app = express();
const PORT = 5000;

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("TrackBack Backend is running!");
});

app.use("/api/problems", problemRoutes);
app.use("/api/import/leetcode", leetcodeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});