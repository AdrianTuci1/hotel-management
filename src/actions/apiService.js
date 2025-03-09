const API_URL = "http://localhost:5001/api"; // Asigură-te că folosești portul corect

const apiService = {
  sendMessage: async (message) => {
    try {
      console.log("📨 Trimit mesaj la API:", message); // Debugging

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      console.log("🔄 API Response Status:", response.status); // Debugging

      if (!response.ok) throw new Error("Eroare la comunicarea cu serverul");

      const data = await response.json();
      console.log("📩 Răspuns API:", data); // Debugging

      return data; // { intent: "show_calendar", message: "📅 Calendar deschis." }
    } catch (error) {
      console.error("❌ Eroare API:", error);
      return { intent: "unknown_intent", message: "❌ Eroare la comunicarea cu serverul" };
    }
  },

  createReservation: async (reservationData) => {

    console.log("📨 Trimit mesaj la API:", reservationData); // Debugging

    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData),
    });

    console.log("🔄 API Response Status:", response.status); // Debugging

    if (!response.ok) throw new Error("Eroare la comunicarea cu serverul");

    const data = await response.json();
    console.log("📩 Răspuns API:", data); // Debugging

    return data; 
  },
};

export default apiService;