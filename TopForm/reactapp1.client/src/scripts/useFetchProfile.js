import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchProfile = async () => {
  const token = localStorage.getItem("jwt");

  const response = await axios.get(
    `https://localhost:7196/api/Profile/get-profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const useFetcProfile = () => {
  return useQuery({
    queryFn: () => fetchProfile(),
  });
};
