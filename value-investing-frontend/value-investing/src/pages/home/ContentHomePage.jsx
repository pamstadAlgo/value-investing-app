import React from "react";
import NavBar from "../GlobalComponents/NavBar";
import OutlinedInput from "@mui/material/OutlinedInput";

function ContentHomePage() {
  return (
    <>
      <NavBar />
      <OutlinedInput className="outlinedinput-dynamic-cv" multiline />
    </>
  );
}

export default ContentHomePage;
