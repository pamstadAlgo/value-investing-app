import axios from "axios";

// create axios instance that is needed for GET, POST, PUT, DELETE requests
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

// create axios interceptor that will add paramters for every request
axiosInstance.interceptors.request.use(function (config) {
  // get ticker symbol
  const ticker = localStorage.getItem("ticker");

  // set ticker in header
  config.headers["ticker"] = ticker;

  return config;
});

export default axiosInstance;
