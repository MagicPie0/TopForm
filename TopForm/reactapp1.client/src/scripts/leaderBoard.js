// useLeaderboardData.js
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const fetchLeaderboardData = async () => {
  try {
    const response = await axios.get("https://localhost:7196/api/Leaderboard/get-leaderboard-details");
    return response.data.leaderboard; // A leaderboard tömb visszaadása
  } catch (error) {
    // Hibakezelés
    if (error.response) {
      // A szerver válasza tartalmaz hibát
      throw new Error(error.response.data.message || "Hiba történt az adatok betöltésekor.");
    } else {
      // Egyéb hiba (pl. hálózati hiba)
      throw new Error("Hálózati hiba történt az adatok betöltésekor.");
    }
  }
};

export function useLeaderboardData() {
  return useMutation({
    mutationFn: fetchLeaderboardData,
    onSuccess: (data) => {
      console.log("Ranglista adatok betöltve:", data);
    },
    onError: (err) => {
      console.error("Hiba történt a ranglista adatok betöltésekor:", err.message);
    },
  });
}