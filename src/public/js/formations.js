const MODALITES = { centre: "En centre", distance: "À distance" };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createDetail(term, description) {
  const row = el("div");
  row.append(el("dt", "", term), el("dd", "", description));
  return row;
}

function createCard(formation) {
  const { titre, dureeMois, modalites, prerequis, certification, debouches } = formation;

  const card = el("article", "card");

  const badges = el("ul", "card-badges");
  badges.append(
    el("li", "badge duree", `${dureeMois} mois`),
    ...modalites.map((m) => el("li", "badge", MODALITES[m] ?? m)),
  );

  const details = el("dl");
  details.append(
    createDetail("Prérequis", prerequis),
    createDetail(
      "Certification",
      `${certification.type} niveau ${certification.niveau} (${certification.equivalent})`,
    ),
    createDetail("Débouchés", debouches.join(", ")),
  );

  card.append(el("h2", "", titre), badges, details);
  return card;
}

const NOMBRES = [
  "Zéro", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf",
  "Dix", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize",
];

function updateCount(count) {
  const counter = document.querySelector("#formations-count");
  if (counter) {
    counter.textContent = NOMBRES[count] ?? String(count);
  }
}

function showStatus(container, text, isError = false) {
  container.replaceChildren(
    el("p", isError ? "formations-status error" : "formations-status", text),
  );
}

export async function initFormations(container) {
  try {
    const response = await fetch("/api/formations");
    if (!response.ok) {
      throw new Error();
    }
    const formations = await response.json();
    container.replaceChildren(...formations.map(createCard));
    updateCount(formations.length);
  } catch {
    showStatus(container, "Impossible de charger les formations.", true);
  }
}
