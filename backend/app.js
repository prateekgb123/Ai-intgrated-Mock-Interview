const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());


// ROUTES

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/upload",
  require("./routes/uploadRoutes")
);

app.use(
  "/api/rag",
  require("./routes/ragRoutes")
);

app.use(
  "/api/interview",
  require("./routes/interviewRoutes")
);
app.use(
"/api/coding",
require("./routes/codingRoutes")
);
app.use(
"/api/resume-analysis",
require(
"./routes/resumeAnalysisRoutes"
)
);
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server Running on Port ${PORT}`
  );
});