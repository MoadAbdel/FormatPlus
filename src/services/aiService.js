import "dotenv/config";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";

const TEMPERATURE = 0.4;
const MAX_COMPLETION_TOKENS = 700;
const GROQ_MODEL = process.env.GROQ_MODEL;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAnswer(prompt) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: TEMPERATURE,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
  });

  return completion.choices[0]?.message?.content?.trim();
}
