import { randomUUID } from "node:crypto";

const MAX_HISTORY_MESSAGES = 10;
const MAX_SESSIONS = 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;

const sessions = new Map();

function isExpired(session) {
  return Date.now() - session.lastSeen > SESSION_TTL_MS;
}

function touch(sessionId, session) {
  session.lastSeen = Date.now();
  sessions.delete(sessionId);
  sessions.set(sessionId, session);
}

function purgeSessions() {
  for (const [sessionId, session] of sessions) {
    if (!isExpired(session)) break;
    sessions.delete(sessionId);
  }

  while (sessions.size >= MAX_SESSIONS) {
    sessions.delete(sessions.keys().next().value);
  }
}

export function createSession() {
  purgeSessions();
  const sessionId = randomUUID();
  sessions.set(sessionId, { history: [], lastSeen: Date.now() });
  return sessionId;
}

export function hasSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) return false;

  if (isExpired(session)) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export function getHistory(sessionId) {
  const session = sessions.get(sessionId);
  touch(sessionId, session);
  return session.history;
}

export function addExchange(sessionId, question, answer) {
  const session = sessions.get(sessionId);

  if (!session) return;

  session.history = [
    ...session.history,
    { role: "user", content: question },
    { role: "assistant", content: answer },
  ].slice(-MAX_HISTORY_MESSAGES);
  touch(sessionId, session);
}
