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
  return response.data;
};

export const useFetchWorkout = (date) => {
  return useQuery({
    queryKey: ["workout", date], 
    queryFn: () => fetchWorkoutByDate(date),
    enabled: !!date, 
  });
};
