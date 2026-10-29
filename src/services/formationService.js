import { readFileSync } from "node:fs";

export const FORMATIONS = JSON.parse(
  readFileSync(new URL("../data/formations.json", import.meta.url), "utf-8"),
);

const MODALITES = { centre: "en centre", distance: "à distance" };

export function formatFormationForPrompt(formation) {
  const modalites = formation.modalites.map((m) => MODALITES[m]).join(" ou ");
  const { type, niveau, equivalent } = formation.certification;
  return (
    `- ${formation.titre} : ${formation.dureeMois} mois, ${modalites}. ` +
    `Prérequis : ${formation.prerequis}. ` +
    `${type} niveau ${niveau} (${equivalent}). ` +
    `Débouchés : ${formation.debouches.join(", ")}.`
  );
}

export function buildCatalogue() {
  return FORMATIONS.map(formatFormationForPrompt).join("\n");
}
