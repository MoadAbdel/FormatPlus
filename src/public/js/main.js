import { initFormations } from "./formations.js";
import { initChatWidget } from "./chatWidget.js";
import { initChat } from "./chat.js";

initFormations(document.querySelector("#formations"));
initChatWidget();
initChat();
