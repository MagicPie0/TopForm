import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchWorkoutByDate = async (date) => {
  const token = localStorage.getItem("jwt");

  const response = await axios.get(
    `https://localhost:7196/api/GetWorkout/workouts?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  //Ha 404-es hiba van, akkor nincs aznapi edzés
  return response.data;
};

export const useFetchWorkout = (date) => {
  return useQuery({
    queryKey: ["workout", date], // Cache key
    queryFn: () => fetchWorkoutByDate(date),
    enabled: !!date, // Csak akkor fusson, ha van dátum
  });
};
