import express from "express";
import path from "path";

const app = express();

const PORT = Number(process.env.PORT || 3101);
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, HOST, () => {
  console.log(`README Prompt Builder: http://${HOST}:${PORT}`);
});
