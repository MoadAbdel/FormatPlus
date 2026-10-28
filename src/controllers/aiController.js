import { generateAnswer } from "../services/aiService.js";
import {
  addExchange,
  createSession,
  getHistory,
  hasSession,
} from "../services/historyService.js";
const MAX_PROMPT_LENGTH = 1000;
const SESSION_COOKIE = "sessionId";

function readSessionId(req) {
  const match = req.headers.cookie?.match(/(?:^|;\s*)sessionId=([^;]+)/);
  return match?.[1];
}

function resolveSession(req, res) {
  const sessionId = readSessionId(req);

  if (sessionId && hasSession(sessionId)) {
    return sessionId;
  }

  const newSessionId = createSession();
  res.cookie(SESSION_COOKIE, newSessionId, { httpOnly: true });
  return newSessionId;
}

export async function testPrompt(req, res) {
  const { prompt } = req.body;

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({
      error: "Le champ prompt est obligatoire.",
    });
  }

  const cleanPrompt = prompt.trim();

  if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: `Le prompt ne doit pas dépasser ${MAX_PROMPT_LENGTH} caractères.`,
    });
  }

  const sessionId = resolveSession(req, res);

  try {
    const answer = await generateAnswer(cleanPrompt, getHistory(sessionId));

    if (!answer) {
      return res.status(502).json({
        error: "Le fournisseur d’IA n’a retourné aucune réponse.",
      });
    }

    addExchange(sessionId, cleanPrompt, answer);

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
}
