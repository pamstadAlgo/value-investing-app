import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axios/axiosConfig";
import { useCookies } from "react-cookie";

import axios from "axios";
import { useDispatch } from "react-redux";
import { resetActiveFilters } from "../../../features/stockScreenerSlice";

function GoogleCallback() {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["access_token"]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Extract the 'code' from the URL
    const url = new URL(window.location.href);
    const google_auth_code = url.searchParams.get("code");

    if (google_auth_code) {
      // send the code to the backend google auth endpoint
      axios
        .post(`${process.env.REACT_APP_BASE_URL}/dj-rest-auth/google/`, {
          code: google_auth_code,
        })
        .then((response) => {
          //reset activ filters in stock screener
          dispatch(resetActiveFilters());
          setCookie("access_token", response.data.access, {
            path: "/",
            secure: true, //only send via HTTPS
            sameSite: "strict",
          });
          navigate("/screener");
        })
        .catch((error) => {
          console.error("error POST /dj-rest-auth/google/: ", error);
        });
    } else {
      console.error("Authorization code not found in URL.");
      alert("Authorization code is missing. Please try again.");
      navigate("/"); // Redirect back to home page
    }
  }, [navigate]);

  return (
    <div>
      <h2>Processing Authentication...</h2>
    </div>
  );
}

export default GoogleCallback;
