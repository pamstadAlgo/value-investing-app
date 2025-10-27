export const computeEBIT = (epvObj, qfsSymbol, caseIndex) => {
  console.log("epvObj that we get: ", epvObj);

  if (epvObj) {
    //get revenue and op margin values
    var revenues = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("Revenue")
    );

    revenues = revenues ? revenues["Revenue"] : 0;

    var opMargins = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("Operating Margin")
    );

    opMargins = opMargins ? opMargins["Operating Margin"] : 0;

    console.log("revenues: ", revenues);
    console.log("opMargins: ", opMargins);

    return revenues[caseIndex] * opMargins[caseIndex];
  }
};

export const computeAdjustedIncome = (epvObj, qfsSymbol, caseIndex) => {
  /* adjusted income = EBIT + D&A - MaintenanceCapex*/
  if (epvObj) {
    // call EBIT function to retrigger computation
    var ebit = computeEBIT(epvObj, qfsSymbol, caseIndex);

    //get revenue and op margin values
    // var ebits = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("EBIT"));
    // ebits = ebits ? ebits["EBIT"] : 0;

    var dA = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("D&A"));
    dA = dA ? dA["D&A"] : 0;

    var mainCapex = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("Maintenance Capex")
    );
    mainCapex = mainCapex ? mainCapex["Maintenance Capex"] : 0;

    // console.log("revenues: ", revenues);
    // console.log("opMargins: ", opMargins);

    return ebit + dA[caseIndex] - mainCapex[caseIndex];
  }
};

export const computeNOPAT = (epvObj, qfsSymbol, caseIndex) => {
  /* sustainable NOPAT = Adjusted Income * (1-taxRate)*/
  if (epvObj) {
    // call EBIT function to retrigger computation
    var adjIncome = computeAdjustedIncome(epvObj, qfsSymbol, caseIndex);

    var tr = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("Tax Rate"));
    tr = tr ? tr["Tax Rate"] : 0;

    return adjIncome * (1 - tr[caseIndex]);
  }
};

export const computeEPVOpBusiness = (epvObj, qfsSymbol, caseIndex) => {
  /* sustainable NOPAT = Adjusted Income * (1-taxRate)*/
  if (epvObj) {
    // call EBIT function to retrigger computation
    var nopat = computeNOPAT(epvObj, qfsSymbol, caseIndex);

    var wacc = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("WACC"));
    wacc = wacc ? wacc["WACC"] : 0;

    return nopat / wacc[caseIndex];
  }
};

export const computeEpvPerShare = (epvObj, qfsSymbol, caseIndex) => {
  if (epvObj) {
    //get revenue and op margin values
    var epvOpBusiness = computeEPVOpBusiness(epvObj, qfsSymbol, caseIndex);
    // epvOpBusiness = epvOpBusiness ? epvOpBusiness["EPV operating business"] : 0;

    var cash = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("Cash"));
    cash = cash ? cash["Cash"] : 0;

    var debt = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("Debt"));
    debt = debt ? debt["Debt"] : 0;

    var nrShares = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("Nr. Shares")
    );
    nrShares = nrShares ? nrShares["Nr. Shares"] : 0;

    return (
      (epvOpBusiness + cash[caseIndex] - debt[caseIndex]) / nrShares[caseIndex]
    );
  }
};
