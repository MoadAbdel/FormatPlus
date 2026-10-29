import "dotenv/config";
import Groq from "groq-sdk";
import {
  OUTPUT_FORMAT_PROMPT,
  PREFERENCES_PROMPT,
  SYSTEM_PROMPT,
} from "../config/systemPrompt.js";
import { buildKnowledgeContext, searchKnowledge } from "./ragService.js";

const TEMPERATURE = 0.6;
const MAX_COMPLETION_TOKENS = 800;
const GROQ_MODEL = process.env.GROQ_MODEL;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function formatPreferences(preferences) {
  if (preferences.length === 0) {
    return "(aucun souvenir enregistré)";
  }

  let lines = "";
  for (const preference of preferences) {
    lines += `- ${preference}\n`;
  }
  return lines.trim();
}

function buildSystemPrompt(preferences, passages) {
  const savedPreferences = `SOUVENIRS ENREGISTRÉS\n${formatPreferences(preferences)}`;
  const knowledge =
    "EXTRAITS DOCUMENTAIRES (appuie-toi dessus en priorité ; s'ils ne répondent pas à la question, dis-le)\n" +
    buildKnowledgeContext(passages);

  return [
    SYSTEM_PROMPT,
    PREFERENCES_PROMPT,
    savedPreferences,
    knowledge,
    OUTPUT_FORMAT_PROMPT,
  ].join("\n");
}

function cleanRefusedList(refusedList) {
  const refused = [];

  if (!Array.isArray(refusedList)) {
    return refused;
  }

  for (const item of refusedList) {
    if (typeof item?.text === "string" && typeof item?.reason === "string") {
      refused.push({ text: item.text, reason: item.reason });
    }
  }
  return refused;
}

function toList(value) {
  return Array.isArray(value) ? value : [];
}

function readModelOutput(rawText) {
  try {
    const output = JSON.parse(rawText);
    const answer =
      typeof output.answer === "string" ? output.answer.trim() : "";

    return {
      answer,
      addPreferences: toList(output.addPreferences),
      removePreferences: toList(output.removePreferences),
      refusedPreferences: cleanRefusedList(output.refusedPreferences),
    };
  } catch {
    return {
      answer: rawText,
      addPreferences: [],
      removePreferences: [],
      refusedPreferences: [],
    };
  }
}

function askModel(messages) {
  return groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: TEMPERATURE,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    reasoning_effort: "low",
    response_format: { type: "json_object" },
  });
}

export async function generateAnswer(prompt, history = [], preferences = []) {
  const passages = searchKnowledge(prompt);
  const messages = [
    { role: "system", content: buildSystemPrompt(preferences, passages) },
    ...history,
    { role: "user", content: prompt },
  ];

  let completion;
  try {
    completion = await askModel(messages);
  } catch (error) {
    console.log(error);
  }

  const rawText = completion.choices[0]?.message?.content?.trim() ?? "";
  const sources = passages.map(({ titre, score }) => ({ titre, score }));
  return { ...readModelOutput(rawText), usage: completion.usage, sources };
}
