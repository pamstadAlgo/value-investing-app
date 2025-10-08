import React from "react";

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

  return <button onClick={googleLogin}>Google Login</button>;
}

export default ContentLoginPage;
