import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const fetchLeaderboardData = async () => {
  try {
    const response = await axios.get("https://localhost:7196/api/Leaderboard/get-leaderboard-details");
    return response.data.leaderboard; 
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Hiba történt az adatok betöltésekor.");
    } else {
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