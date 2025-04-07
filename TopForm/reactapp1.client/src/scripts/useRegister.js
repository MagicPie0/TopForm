import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const registerUser = async ({ name, email, birthDate, username, password }) => {
  try {
    const response = await axios.post(
      "https://localhost:7196/api/Registration/register",
      { name, email, birthDate, username, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    // Hibakezelés
    if (error.response) {
      // A szerver válasza tartalmaz hibát
      throw new Error(error.response.data.message || "Hiba történt a regisztráció során.");
    } else {
      // Egyéb hiba (pl. hálózati hiba)
      throw new Error("Hálózati hiba történt a regisztráció során.");
    }
  }
};

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("JWT Token:", data.jwt); // 🔹 Kiírja a JWT-t a konzolra
      localStorage.setItem("jwt", data.jwt);
    },
    onError: (error) => {
      console.error("Regisztrációs hiba:", error.message);
    },
  });
}