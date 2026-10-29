import { addMessage } from "./chatMessages.js";

const WELCOME_MESSAGE =
  "Bonjour et bienvenue chez FormaPlus. Je peux vous présenter nos formations, leurs prérequis, les étapes d’inscription et les financements possibles. Que souhaitez-vous savoir ?";

export function initChat() {
  addMessage("assistant", WELCOME_MESSAGE);

  const form = document.querySelector("#chat-form");
  const promptInput = document.querySelector("#prompt");
  const button = form.querySelector("button");

  function resizeInput() {
    promptInput.style.height = "auto";
    promptInput.style.height = `${Math.min(promptInput.scrollHeight + 2, 160)}px`;
  }

  async function sendMessage(prompt) {
    addMessage("user", prompt);

    button.disabled = true;
    const typing = addMessage("assistant", "…");

    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      typing.remove();
      addMessage("assistant", data.answer);
    } catch (error) {
      typing.remove();
      addMessage("error", error.message);
    } finally {
      button.disabled = false;
      promptInput.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const prompt = promptInput.value.trim();

    if (!prompt || button.disabled) {
      return;
    }

    promptInput.value = "";
    resizeInput();
    sendMessage(prompt);
  });

  promptInput.addEventListener("input", resizeInput);

  promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}
