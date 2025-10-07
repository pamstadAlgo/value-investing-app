import React, { useEffect } from "react";
import NavBar from "../GlobalComponents/NavBar";
import DataView from "./components/DataView";
import useAxiosWithAuth from "../../axios/useAxiosWithAuth";
import { useDispatch, useSelector } from "react-redux";
import { initializeMccProfiles } from "../../features/microcapSlice";

function ContentMCCPage() {
  const mccState = useSelector((state) => state.microcap);

  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  //fetch current data from microcap club profile
  useEffect(() => {
    axiosInstanceAuth
      .get("screener/micropcapclub-profiles/")
      .then((response) => {
        dispatch(initializeMccProfiles(response.data));
        // console.log("resonse microcap clubs: ", response.data);
      })
      .catch((error) => {
        console.error("ERROR: GET screener/charfield-filter-options/: ", error);
      });
  }, []);

  return (
    <>
      <NavBar />
      <div className="content-wrapper">
        <div className="flex-wrapper-screener-title-section">
          <h1>MicroCap Club Profiles</h1>
        </div>
        <DataView />
      </div>
    </>
  );
}

export default ContentMCCPage;
