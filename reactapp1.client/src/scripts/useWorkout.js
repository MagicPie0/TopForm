import axios from "axios";
import { useMutation } from "@tanstack/react-query";

// Token validation function
function isTokenValid(token) {
  if (!token) return false;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const payload = JSON.parse(window.atob(base64));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
}

const workout = async (workoutData) => {
  const jwt = localStorage.getItem("jwt");
  console.log("JWT token:", jwt);
  // Enhanced token validation
  if (!jwt || !isTokenValid(jwt)) {
    console.error("Invalid or expired JWT");
    throw new Error("Authentication token is invalid or expired");
  }

  try {
    const response = await axios.post(
      "https://localhost:7196/api/Workouts",
      workoutData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    // Hibakezelés
    if (error.response) {
      // A szerver válasza tartalmaz hibát
      console.error("Server response:", error.response.data);
      throw new Error(error.response.data || error.response.statusText);
    } else {
      // Egyéb hiba (pl. hálózati hiba)
      console.error("Workout save error:", error.message);
      throw new Error("Hálózati hiba történt az edzés mentése során.");
    }
  }
};

export function useWorkout() {
  return useMutation({
    mutationFn: workout,
    onSuccess: (data) => {
      console.log("Workout saved successfully:", data);
    },
    onError: (error) => {
      console.error("Workout save failed:", error.message);
      // Opcionális: felhasználóbarát hibakezelés
      // Például: toast vagy alert megjelenítése
    },
  });
}