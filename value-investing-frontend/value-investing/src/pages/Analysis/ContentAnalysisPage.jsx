import React, { useState } from "react";
import NavBar from "../GlobalComponents/NavBar";
import TickerAutoComplete from "../valuation/components/TickerAutoComplete";
import CompanySearchField from "./Components/CompanySearchField";
import AnalysisTabs from "./Components/AnalysisTabs";
import CompanyOverview from "./Components/CompanyOverview";
import ValuationModel from "./Components/ValuationModel";

function ContentAnalysisPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <NavBar />
      <main className="main-content-wrapper relative-position">
        <div className="flex-wrapper-main-content">
          {/* <CompanySearchField /> */}
          <CompanySearchField />
          <AnalysisTabs tab={tab} setTab={setTab} />
          {tab == 0 && <CompanyOverview />}
          {tab == 1 && <ValuationModel />}
        </div>
      </main>
    </>
  );
}

export default ContentAnalysisPage;
