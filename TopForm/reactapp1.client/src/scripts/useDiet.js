import axios from "axios";
import { useMutation } from "@tanstack/react-query";

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

const diet = async (dietData) => {
  const jwt = localStorage.getItem("jwt");
  console.log("JWT token:", jwt);
  // Enhanced token validation
  if (!jwt || !isTokenValid(jwt)) {
    console.error("Invalid or expired JWT");
    throw new Error("Authentication token is invalid or expired");
  }

  try {
    const response = await axios.post(
      "https://localhost:7196/api/Diet",
      dietData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server response:", error.response.data);
      throw new Error(error.response.data || error.response.statusText);
    } else {
      console.error("Diet save error:", error.message);
      throw new Error("Hálózati hiba történt a diéta mentése során.");
    }
  }
};

export function useDiet() {
  return useMutation({
    mutationFn: diet,
    onSuccess: (data) => {
      console.log("Diet saved successfully:", data);
    },
    onError: (error) => {
      console.error("Diet save failed:", error.message);
    },
  });
}