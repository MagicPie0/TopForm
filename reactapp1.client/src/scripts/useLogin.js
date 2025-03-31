import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post("https://localhost:7196/api/auth/login", {
      username,
      password,
    });

    // Ha a válasz sikeres, visszaadjuk az adatokat
    return response.data;
  } catch (error) {
    // Hibakezelés
    if (error.response) {
      // A szerror válasza tartalmaz hibát
      const errorMessage = error.response.data.message || "Hibás felhasználónév vagy jelszó.";
      throw new Error(errorMessage);
    } else {
      // Egyéb hiba (pl. hálózati hiba)
      throw new Error("Hiba történt a bejelentkezés során.");
    }
  }
};

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // JWT token mentése localStorage-ba
      localStorage.setItem("jwt", data.token);
      console.log("Jwt token: ", localStorage.getItem("jwt"));
    },
  });
}