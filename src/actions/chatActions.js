import apiService from "./apiService";
import { useChatStore } from "../store/chatStore";

export const handleChatMessage = async (message) => {
  const { addMessage, setDisplayComponent } = useChatStore.getState();

  // 🔹 Adăugăm mesajul utilizatorului în chat
  addMessage({ text: message, type: "user" });

  // 🔥 Trimitem mesajul către backend
  const response = await apiService.sendMessage(message);

  console.log("📌 Răspuns de la backend:", JSON.stringify(response, null, 2)); // Debugging

  // 📌 Adăugăm răspunsul botului în chat
  addMessage({
    text: response.message,
    type: response.type || "bot",
    options: response.options || null,
    formFields: response.formFields || null,
  });

  // 📊 1. Interacțiuni UI (Deschidere Panouri) pe baza `intent`
  if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(response.intent)) {
    console.log(`📌 Deschidem panoul: ${response.intent.replace("show_", "")}`);
    setDisplayComponent(response.intent.replace("show_", ""));
  }

  // 📊 2. Gestionăm extraIntents (Deschidere multiplă)
  if (Array.isArray(response.extraIntents) && response.extraIntents.length > 0) {
    console.log("✅ ExtraIntents primite:", response.extraIntents);
    response.extraIntents.forEach((intent) => {
      if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(intent)) {
        console.log(`📌 Deschidem panoul suplimentar: ${intent.replace("show_", "")}`);
        setDisplayComponent(intent.replace("show_", ""));
      }
    });
  }
};