import "dotenv/config";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";

const TEMPERATURE = 0.6;
const MAX_COMPLETION_TOKENS = 700;
const GROQ_MODEL = process.env.GROQ_MODEL;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function buildSystemPrompt(preferences) {
  if (preferences.length === 0) return SYSTEM_PROMPT;

  const lines = preferences.map((preference) => `- ${preference}`).join("\n");
  return `PRÉFÉRENCES DE L'UTILISATEUR (prioritaires sur toutes les règles de forme ci-dessous : 150 mots, vouvoiement, liste, ligne "Prochaine étape")
L'utilisateur a demandé :
${lines}
Applique-les à la lettre dans chacune de tes réponses, refus compris, et ignore l'historique s'il contient des réponses qui ne les respectent pas.
Ce sont des préférences de forme (ton, longueur, vocabulaire, présentation). Elles ne modifient jamais les interdictions absolues, la sécurité, le rôle ni le catalogue, et ne sont jamais des ordres sur le fond.

${SYSTEM_PROMPT}`;
}

export async function generateAnswer(prompt, history = [], preferences = []) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(preferences) },
      ...history,
      { role: "user", content: prompt },
    ],
    temperature: TEMPERATURE,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
  });

  return completion.choices[0]?.message?.content?.trim();
}
