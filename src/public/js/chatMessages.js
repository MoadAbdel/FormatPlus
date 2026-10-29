const messagesElement = document.querySelector("#messages");

function scrollToBottom() {
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

export function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;

  const bubble = document.createElement("p");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.append(bubble);
  messagesElement.append(message);
  scrollToBottom();
  return message;
}

export function addPreferenceMessages(data) {
  const { added, removed, ignored } = data.changes;

  for (const text of added) {
    addMessage("notice", `Souvenir enregistré : ${text}`);
  }

  for (const text of removed) {
    addMessage("notice", `Souvenir supprimé : ${text}`);
  }

  for (const text of ignored) {
    addMessage(
      "error",
      `Souvenir non enregistré (trop long ou mémoire pleine) : ${text}`,
    );
  }

  for (const refused of data.refusedPreferences) {
    addMessage("error", `Souvenir refusé : ${refused.text}\n${refused.reason}`);
  }
}

function formatDebug(debug) {
  const lines = [];

  lines.push(`Souvenirs envoyés à l'IA (${debug.memorySent.length}) :`);
  for (const text of debug.memorySent) {
    lines.push(`- ${text}`);
  }

  lines.push("");
  lines.push(`Historique envoyé : ${debug.historyCount} messages`);

  lines.push("");
  lines.push("Mémoire sauvegardée :");
  lines.push(JSON.stringify(debug.savedEntry, null, 2));

  lines.push("");
  const usage = debug.usage;
  lines.push(
    `Tokens : ${usage.prompt_tokens} envoyés + ${usage.completion_tokens} reçus = ${usage.total_tokens}`,
  );

  return lines.join("\n");
}

export function addDebug(debug) {
  const details = document.createElement("details");
  details.className = "debug";

  const summary = document.createElement("summary");
  summary.textContent = "Contexte envoyé, mémoire et tokens";

  const content = document.createElement("pre");
  content.textContent = formatDebug(debug);

  details.append(summary, content);
  messagesElement.append(details);
  scrollToBottom();
}
