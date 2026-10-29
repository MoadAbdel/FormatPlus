import { readFileSync } from "node:fs";

const KNOWLEDGE = JSON.parse(
  readFileSync(new URL("../data/knowledge.json", import.meta.url), "utf-8"),
);

const TOP_K = 3;
const SEUIL_TEXTE_COMPLET = 50;
const SEUIL_RESUME = 25;
const MOTS_VIDES = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "au",
  "aux", "en", "pour", "par", "sur", "avec", "dans", "il", "elle", "je",
  "vous", "on", "est", "faut", "quel", "quels", "quelle", "quelles",
  "comment", "combien", "que", "qui", "quoi", "ce", "ces", "mon", "ma", "mes",
]);

// "Quels papiers ?" -> ["papier"]
function toWords(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !MOTS_VIDES.has(word))
    .map((word) => word.replace(/s$/, ""));
}

function countFound(questionWords, words) {
  const found = new Set(words);
  return questionWords.filter((word) => found.has(word)).length;
}

// Score sur 100 : mots-clés (60) + titre (20) + texte (20)
function scorePassage(questionWords, passage) {
  if (questionWords.length === 0) {
    return 0;
  }

  const motsCles = countFound(questionWords, passage.motsCles.flatMap(toWords));
  const titre = countFound(questionWords, toWords(passage.titre));
  const texte = countFound(questionWords, toWords(passage.texte));

  const score =
    Math.min(motsCles * 20, 60) +
    Math.min(titre * 10, 20) +
    Math.round((texte / questionWords.length) * 20);

  return Math.min(score, 100);
}

export function searchKnowledge(question) {
  const questionWords = toWords(question);

  return KNOWLEDGE.map((passage) => ({
    ...passage,
    score: scorePassage(questionWords, passage),
  }))
    .filter((passage) => passage.score >= SEUIL_RESUME)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}

export function buildKnowledgeContext(passages) {
  if (passages.length === 0) {
    return "(aucun extrait pertinent)";
  }

  let lines = "";
  for (const passage of passages) {
    const content =
      passage.score >= SEUIL_TEXTE_COMPLET ? passage.texte : passage.resume;
    lines += `- [${passage.titre} | score ${passage.score}/100] ${content}\n`;
  }
  return lines.trim();
}
