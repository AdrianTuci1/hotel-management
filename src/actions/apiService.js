const API_URL = "http://localhost:5001/api"; // Asigură-te că folosești portul corect

const apiService = {

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

  getRooms: async () => {
    const response = await fetch(`${API_URL}/rooms`);
    if (!response.ok) throw new Error("❌ Eroare la preluarea camerelor!");
    return response.json();
  },
};

export default apiService;