import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Enable CORS for all routes, including preflight
app.use(cors({ origin: "*", methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type"] }));

// ✅ Parse JSON body
app.use(express.json());

const APPS_SCRIPT_URL = process.env.VITE_GOOGLE_SHEETS_URL;

// POST proxy endpoint
app.post("/api/students", async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();
    res.status(200).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OPTIONS preflight for all routes
app.options("*", cors());

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Proxy running on port ${PORT}`));
