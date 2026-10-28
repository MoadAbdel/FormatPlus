import { randomUUID } from "node:crypto";

const MAX_HISTORY_MESSAGES = 10;

const sessions = new Map();

export function createSession() {
  const sessionId = randomUUID();
  sessions.set(sessionId, []);
  return sessionId;
}

export function hasSession(sessionId) {
  return sessions.has(sessionId);
}

export function getHistory(sessionId) {
  return sessions.get(sessionId);
}

export function addExchange(sessionId, question, answer) {
  sessions.set(
    sessionId,
    [
      ...sessions.get(sessionId),
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ].slice(-MAX_HISTORY_MESSAGES)
  );
}
