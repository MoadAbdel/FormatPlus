import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ressource introuvable." });
});

export default app;
