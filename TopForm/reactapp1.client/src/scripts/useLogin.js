import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post("https://localhost:7196/api/auth/login", {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message || "Hibás felhasználónév vagy jelszó.";
      throw new Error(errorMessage);
    } else {
      throw new Error("Hiba történt a bejelentkezés során.");
    }
  }
};

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("jwt", data.token);
      console.log("Jwt token: ", localStorage.getItem("jwt"));
    },
  });
}