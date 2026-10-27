const form = document.querySelector("#prompt-form");
const promptInput = document.querySelector("#prompt");
const statusElement = document.querySelector("#status");
const answerElement = document.querySelector("#answer");
const button = form.querySelector("button");
const counter = document.querySelector("#counter");

promptInput.addEventListener("input", () => {
  counter.textContent = `${promptInput.value.length} / 1000`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = promptInput.value.trim();

  if (!prompt) {
    statusElement.textContent = "Veuillez saisir un scénario.";
    return;
  }

  button.disabled = true;
  statusElement.textContent = "Test en cours…";
  answerElement.textContent = "";
  answerElement.classList.remove("error");

  try {
    const response = await fetch("/api/ai/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Une erreur est survenue.");
    }

    statusElement.textContent = "Réponse obtenue :";
    answerElement.textContent = data.answer;
  } catch (error) {
    statusElement.textContent = "Échec du test.";
    answerElement.textContent = error.message;
    answerElement.classList.add("error");
  } finally {
    button.disabled = false;
  }
});
