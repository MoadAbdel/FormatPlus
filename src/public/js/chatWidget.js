export function initChatWidget() {
  const toggle = document.querySelector("#chat-toggle");
  const panel = document.querySelector("#chat-panel");
  const close = document.querySelector("#chat-close");
  const promptInput = document.querySelector("#prompt");

  function setOpen(open) {
    panel.hidden = !open;
    toggle.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));

    if (open) {
      promptInput.focus();
    } else {
      toggle.focus();
    }
  }

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  for (const opener of document.querySelectorAll("[data-open-chat]")) {
    opener.addEventListener("click", () => setOpen(true));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
    }
  });
}
