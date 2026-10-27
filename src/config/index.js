import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MAX_PROMPT_LENGTH = 1000;
export const TEMPERATURE = "0.4";
export const MAX_COMPLETION_TOKENS = 700;
export const GROQ_MODEL = process.env.GROQ_MODEL;

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
