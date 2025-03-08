import apiService from "./apiService";
import { useChatStore } from "../store/chatStore";

export const handleChatMessage = async (message) => {
  const { addMessage, setDisplayComponent } = useChatStore.getState();

  // 🔹 Adăugăm mesajul utilizatorului în chat
  addMessage(message, "user");

  // 🔥 Trimitem mesajul către backend
  const response = await apiService.sendMessage(message);

  console.log("📌 Intent detectat:", response.intent); // Debug
  console.log("📩 Mesaj primit:", response.message); // Debug

  // 🔹 Verificăm tipul de interacțiune

  // 📊 1. Interacțiuni UI (Deschidere Panouri)
  if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(response.intent)) {
    setDisplayComponent(response.intent.replace("show_", ""));
    return;
  }

  // 📌 2. Interacțiuni Chat (Afișare opțiuni, formulare, confirmări)
  if (response.type === "options") {
    addMessage(response.message, "options", response.options);
  } else if (response.type === "form") {
    addMessage(response.message, "form", null, response.formFields);
  } else if (response.type === "confirm") {
    addMessage(response.message, "confirm");
  } else {
    addMessage(response.message, "bot");
  }
};