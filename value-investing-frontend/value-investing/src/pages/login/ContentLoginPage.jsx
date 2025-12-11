import React from "react";
import BackgroundChart from "./components/BackgroundChart";
import CompanyLogo from "../GlobalComponents/CompanyLogo";
import GoogleIcon from "./components/GoogleIcon";
import BackgroundChartSecond from "./components/BackgroundChartSecond";

function ContentLoginPage() {
  const googleLogin = () => {
    let googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    let googleCallbackURI = process.env.REACT_APP_GOOGLE_CALLBACK_URI;

    console.log("googleCallbackURI react frontend: ", googleCallbackURI);
    console.log("googleClientId react frontend: ", googleClientId);

    try {
      //replace current url with the google auth URL; this will direct you to the google login form
      window.location.replace(
        `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${googleCallbackURI}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline`
      );
    } catch (err) {
      console.error("Error during redirect:", err);
      alert("An unexpected error occurred while redirecting to Google.");
    }
  };

  return (
    <>
      <BackgroundChart />
      {/* <BackgroundChartSecond /> */}
      <div className="flex-wrapper-login-card">
        <div className="flex-box-wrapper-logo">
          <CompanyLogo />
          <h2 className="header-color-black-scale ">StockVal</h2>
        </div>
        <div className="login-card glass-card" style={{ zIndex: 2 }}>
          <div className="login-page-title">Welcome Back</div>
          <div className="login-sub-title">
            Login to access the application.
          </div>
          <div className="wrapper-google-button">
            <button onClick={googleLogin} className="google-button-login">
              <GoogleIcon className="google-icon-login-button" />
              <div className="login-button-text">Google Login</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContentLoginPage;
