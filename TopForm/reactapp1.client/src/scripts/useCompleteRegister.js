import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const completeRegistrationData = async ({ gender, measurements }) => {
  const jwt = localStorage.getItem("jwt");
  console.log(jwt);

  const muscleGroupData = measurements
    .filter((m) => m.name && m.kg) 
    .map((m) => ({
      name: m.name, 
      kg: m.kg, 
    }));

  console.log("Processed MuscleGroups:", muscleGroupData);

  if (muscleGroupData.length === 0) {
    throw new Error("Kérjük, adjon meg legalább egy izomcsoportot!");
  }

  const dataToSend = {
    Men: gender === "female" ? 1 : 0,
    MuscleGroups: muscleGroupData,
  };

  console.log("Sending data to backend:", dataToSend);

  try {
    const response = await axios.post(
      "https://localhost:7196/api/Registration/update-user-muscles",
      dataToSend,
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
      throw new Error(error.response.data.message || "Registration completion failed");
    } else {
      throw new Error("Hálózati hiba történt a regisztráció befejezése során.");
    }
  }
};

export function useCompleteRegister() {
  return useMutation({
    mutationFn: completeRegistrationData,
    onSuccess: (data) => {
      console.log("JWT Token:", data.jwt);
    },
    onError: (err) => {
      console.error("Hiba történt a regisztráció befejezése során:", err.message);
    },
  });
}