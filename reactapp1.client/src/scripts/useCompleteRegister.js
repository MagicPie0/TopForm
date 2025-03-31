import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const completeRegistrationData = async ({ gender, measurements }) => {
  const jwt = localStorage.getItem("jwt");
  console.log(jwt);

  // Process the measurements array
  const muscleGroupData = measurements
    .filter((m) => m.name && m.kg) // Ensure that name and kg are not empty
    .map((m) => ({
      name: m.name, // Already in the correct format
      kg: m.kg, // Use kg instead of weight
    }));

  console.log("Processed MuscleGroups:", muscleGroupData); // Debug log

  if (muscleGroupData.length === 0) {
    throw new Error("Kérjük, adjon meg legalább egy izomcsoportot!");
  }

  const dataToSend = {
    Men: gender === "female" ? 1 : 0,
    MuscleGroups: muscleGroupData,
  };

  console.log("Sending data to backend:", dataToSend); // Check what is being sent

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
    // Hibakezelés
    if (error.response) {
      // A szerver válasza tartalmaz hibát
      throw new Error(error.response.data.message || "Registration completion failed");
    } else {
      // Egyéb hiba (pl. hálózati hiba)
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