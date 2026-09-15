const express = require("express");
const connectDB = require("./connect");
const Problem = require("./models/Problem");
const problemRoutes = require("./routes/problemRoutes");
const app= express();
connectDB();

const PORT = 5000;

app.use(express.json());

app.get('/',(req,res) => {
    res.send("Trackback backend is running ");
})

app.use("/api/problems", problemRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})