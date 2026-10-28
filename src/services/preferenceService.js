import fs from "node:fs";

const FILE = "preferences.json";
const TTL_MS = 30 * 60 * 1000;
const MAX_LENGTH = 80;

const TRIGGER =
  /^(enregistre|retiens|j['’]aimerais|je voudrais|je veux|r[ée]pond|utilise)\s*:?\s*(.+)$/i;
const DELETE =
  /^(supprime|efface|oublie|annule)\s+(mes préférences|la consigne\s+(\w+))/i;
const TYPES = {
  longueur: /court|br[èe]ve?|concis|détaillé|longues|complet/i,
  ton: /tutoie|vouvoie|formel|familier/i,
  format: /liste|puce/i,
  vocabulaire: /simple|jargon/i,
};

function readFile() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function writeFile(data) {
  for (const sessionId in data) {
    if (Date.now() - data[sessionId].lastSeen > TTL_MS) delete data[sessionId];
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function saveRules(data, sessionId, rules) {
  data[sessionId] = { rules, lastSeen: Date.now() };
  writeFile(data);
}

function cleanSentence(text) {
  return text.replace(/["`\n\r]/g, " ").trim();
}

function findType(sentence) {
  return Object.keys(TYPES).find((type) => TYPES[type].test(sentence));
}

function deleteRules(data, sessionId, rules, type) {
  if (type) {
    const remainingRules = rules.filter((rule) => rule.type !== type);
    saveRules(data, sessionId, remainingRules);
    return `La consigne « ${type} » est supprimée.`;
  } else {
    saveRules(data, sessionId, []);
    return "Vos préférences sont supprimées.";
  }
}

function addRule(data, sessionId, rules, type, sentence) {
  const otherRules = rules.filter((rule) => rule.type !== type);
  const newRules = [...otherRules, { type, value: sentence }];
  saveRules(data, sessionId, newRules);
  return `C'est noté : « ${sentence} ».`;
}

export function getPreferences(sessionId) {
  const rules = readFile()[sessionId]?.rules ?? [];
  return rules.map((rule) => rule.value);
}

export function handlePreference(sessionId, message) {
  const data = readFile();
  const rules = data[sessionId]?.rules ?? [];

  const deleteMatch = message.match(DELETE);
  if (deleteMatch) {
    const type = deleteMatch[3]?.toLowerCase();
    return deleteRules(data, sessionId, rules, type);
  }

  const triggerMatch = message.match(TRIGGER);
  if (!triggerMatch) return null;

  const sentence = cleanSentence(message);
  const type = findType(sentence);
  if (!type) return null;

  if (sentence.length > MAX_LENGTH) {
    return `Votre consigne est trop longue (${MAX_LENGTH} caractères maximum).`;
  }

  return addRule(data, sessionId, rules, type, sentence);
}
