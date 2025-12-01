import React, { useState } from "react";
import NavBar from "../GlobalComponents/NavBar";
import TickerAutoComplete from "../valuation/components/TickerAutoComplete";
import CompanySearchField from "./Components/CompanySearchField";
import AnalysisTabs from "./Components/AnalysisTabs";
import CompanyOverview from "./Components/CompanyOverview";
import ValuationModel from "./Components/ValuationModel";
import { useSelector } from "react-redux";
import BackdropLoading from "../GlobalComponents/BackdropLoading";
import Layout from "../GlobalComponents/Layout";

function ContentAnalysisPage() {
  const analysisState = useSelector((state) => state.analysis);
  const [backDropLoading, setBackDropLoading] = useState(false);
  const [tab, setTab] = useState(0);

  return (
    <>
      {/* <NavBar /> */}
      <Layout>
        <main className="main-content-wrapper relative-position">
          <div className="flex-wrapper-main-content">
            {/* <CompanySearchField /> */}
            <CompanySearchField setBackdropLoading={setBackDropLoading} />

            {analysisState.selectedTickerSymbol && (
              <>
                {" "}
                <AnalysisTabs tab={tab} setTab={setTab} />
                {tab == 0 && <CompanyOverview />}
                {tab == 1 && (
                  <ValuationModel
                    qfsSymbol={analysisState?.selectedTickerSymbol?.qfs_symbol}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </Layout>
      <BackdropLoading open={backDropLoading} />
    </>
  );
}

export default ContentAnalysisPage;
