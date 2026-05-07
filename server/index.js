// ============================================================
// ChitChat — NDIS Assistant Backend
// server/index.js — server setup only
// ============================================================

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middleware/errorhandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ChitChat NDIS Assistant is running!" });
});

app.use(chatRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ ChitChat server running on http://localhost:${PORT}`);
});

// Re-export for testing (unit tests can import getPricingInfo directly)
export { getPricingInfo } from "./tools/index.js";
