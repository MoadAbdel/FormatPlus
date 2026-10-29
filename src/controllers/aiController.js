import { generateAnswer } from "../services/aiService.js";
import {
  addExchange,
  createSession,
  getHistory,
  hasSession,
} from "../services/historyService.js";
import {
  getPreferences,
  getSavedEntry,
  savePreferences,
} from "../services/preferenceService.js";
const MAX_PROMPT_LENGTH = 1000;
const SESSION_COOKIE = "sessionId";
const ERROR_MESSAGES = {
  401: "Clé API Groq absente ou invalide.",
  429: "L'assistant reçoit trop de demandes. Réessayez dans quelques secondes.",
};

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
  res.cookie(SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
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
    const history = getHistory(sessionId);
    const preferences = getPreferences(sessionId);

    const {
      answer,
      addPreferences,
      removePreferences,
      refusedPreferences,
      usage,
    } = await generateAnswer(cleanPrompt, history, preferences);

    if (!answer) {
      return res.status(502).json({
        error: "Le fournisseur d’IA n’a retourné aucune réponse.",
      });
    }

    addExchange(sessionId, cleanPrompt, answer);

    const changes = savePreferences(
      sessionId,
      addPreferences,
      removePreferences,
    );

    const response = { answer, changes, refusedPreferences };

    if (process.env.NODE_ENV !== "production") {
      response.debug = {
        memorySent: preferences,
        historyCount: history.length,
        savedEntry: getSavedEntry(sessionId),
        usage,
      };
    }

    return res.json(response);
  } catch (error) {
    console.error("Erreur Groq :", error);

    const knownStatus = error?.status === 401 || error?.status === 429;
    const status = knownStatus ? error.status : 500;
    const message =
      ERROR_MESSAGES[status] ??
      "Impossible de générer une réponse pour le moment.";

    return res.status(status).json({ error: message });
  }
}
