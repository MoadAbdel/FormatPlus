import fs from "node:fs";

const FILE = "preferences.json";
const SESSION_DURATION = 30 * 60 * 1000;
const MAX_PREFERENCES = 15;
const MAX_LENGTH = 150;

function readFile() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeFile(data) {
  for (const sessionId in data) {
    const age = Date.now() - data[sessionId].lastSeen;
    if (age > SESSION_DURATION) {
      delete data[sessionId];
    }
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function cleanText(text) {
  return text.replace(/["`\n\r]/g, " ").replace(/\s+/g, " ").trim();
}

function normalize(text) {
  return cleanText(text).toLowerCase().replace(/’/g, "'");
}

function findPreferences(data, sessionId) {
  const entry = data[sessionId];

  if (!entry || !Array.isArray(entry.preferences)) {
    return [];
  }

  const age = Date.now() - entry.lastSeen;
  if (age > SESSION_DURATION) {
    return [];
  }

  return entry.preferences;
}

export function getPreferences(sessionId) {
  const data = readFile();
  const preferences = findPreferences(data, sessionId);

  if (preferences.length > 0) {
    data[sessionId].lastSeen = Date.now();
    writeFile(data);
  }

  return preferences;
}

export function getSavedEntry(sessionId) {
  return readFile()[sessionId] ?? null;
}

export function savePreferences(sessionId, addList, removeList) {
  const data = readFile();
  const oldPreferences = findPreferences(data, sessionId);

  const textsToRemove = [];
  for (const item of removeList) {
    if (typeof item === "string") {
      textsToRemove.push(normalize(item));
    }
  }

  const preferences = [];
  const removed = [];
  for (const text of oldPreferences) {
    if (textsToRemove.includes(normalize(text))) {
      removed.push(text);
    } else {
      preferences.push(text);
    }
  }

  const added = [];
  const ignored = [];
  for (const item of addList) {
    if (typeof item !== "string") {
      continue;
    }

    const text = cleanText(item);
    const isKnown = preferences.some((preference) => {
      return normalize(preference) === normalize(text);
    });
    if (text === "" || isKnown) {
      continue;
    }

    if (text.length > MAX_LENGTH || preferences.length >= MAX_PREFERENCES) {
      ignored.push(text);
      continue;
    }

    preferences.push(text);
    added.push(text);
  }

  if (added.length > 0 || removed.length > 0) {
    data[sessionId] = { preferences, lastSeen: Date.now() };
    writeFile(data);
  }

  return { added, removed, ignored };
}
