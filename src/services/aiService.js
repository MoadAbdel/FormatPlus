import {
  groq,
  GROQ_MODEL,
  TEMPERATURE,
  MAX_COMPLETION_TOKENS,
} from "../config/index.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";

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
