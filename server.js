import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_PROMPT_LENGTH = 1000;

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ La variable GROQ_API_KEY est absente.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// TODO 1 : analyser le cahier des charges de votre client.
// TODO 2 : remplacer ce prompt générique par un prompt système complet.
// Il doit contenir au minimum :
// - le rôle de l’assistant ;
// - le contexte métier ;
// - le public cible ;
// - les objectifs ;
// - le ton attendu ;
// - les limites et interdictions ;
// - le comportement à adopter lorsqu’il ne sait pas répondre.
const SYSTEM_PROMPT = `
Tu es un assistant utile.
Réponds clairement à l'utilisateur.
`;

app.post("/api/ai/test", async (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({
      error: "Le champ prompt est obligatoire."
    });
  }

  const cleanPrompt = prompt.trim();

  if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: `Le prompt ne doit pas dépasser ${MAX_PROMPT_LENGTH} caractères.`
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: cleanPrompt
        }
      ],
      temperature: 0.4,
      max_completion_tokens: 700
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        error: "Le fournisseur d’IA n’a retourné aucune réponse."
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Erreur Groq :", error);

    const status = error?.status === 401 ? 401 : 500;
    const message =
      status === 401
        ? "Clé API Groq absente ou invalide."
        : "Impossible de générer une réponse pour le moment.";

    return res.status(status).json({ error: message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Ressource introuvable." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
