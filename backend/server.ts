import express from "express";
import cors from "cors";
import { initializeDataDragon } from "./services/dataDragon";
import analyzeRoutes from "./routes/analyze";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialization
initializeDataDragon();

// Routes
app.use("/api/analyze-match", analyzeRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🤖 AI Server running at http://localhost:${PORT}`);
});
