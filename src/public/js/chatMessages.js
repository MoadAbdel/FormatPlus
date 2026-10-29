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
