import axios from "axios";
import { useCookies } from "react-cookie";

const useAxiosWithAuth = () => {
  const [cookies] = useCookies(["access_token"]);

  // Create an instance of Axios
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL, // backend base URL
  });

  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Retrieve access_token from cookies
      const accessToken = cookies.access_token;

      if (accessToken) {
        config.headers.Authorization = accessToken
          ? `Bearer ${accessToken}`
          : "";
      }

      return config;
    },
    (error) => {
      // Handle errors in request setup
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxiosWithAuth;
