// src/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3101);
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.static(path.join(__dirname, "..", "public")));
// app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, HOST, () => {
  console.log(`README Prompt Builder: http://${HOST}:${PORT}`);
});
