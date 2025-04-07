import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchDietByDate = async (date) => {
  if (!date) return null;
  
  const token = localStorage.getItem("jwt");

  try {
    const response = await axios.get(
      `https://localhost:7196/api/GetDiet/diet?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // No diet for this date, return empty data
      return null;
    }
    throw error;
  }
};

export const useFetchDiet = (date) => {
  return useQuery({
    queryKey: ["diet", date],
    queryFn: () => fetchDietByDate(date),
    enabled: !!date,
  });
};