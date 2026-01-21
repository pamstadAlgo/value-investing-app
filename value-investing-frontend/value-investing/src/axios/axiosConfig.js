import axios from "axios";

// create axios instance that is needed for GET, POST, PUT, DELETE requests
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// create axios interceptor that will add parameters for every request
axiosInstance.interceptors.request.use(
  function (config) {
    // get ticker symbol
    const ticker = localStorage.getItem("ticker");

    // set ticker in header
    if (ticker) {
      config.headers["ticker"] = ticker;
    }

    // Get access token from cookies
    const accessToken = getCookie("access_token");

    // If token exists, add Authorization header
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
