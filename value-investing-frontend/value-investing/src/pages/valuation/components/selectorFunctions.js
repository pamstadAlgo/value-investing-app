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

export const computeEpvPerShare = (epvObj, qfsSymbol, caseIndex) => {
  if (epvObj) {
    //get revenue and op margin values
    var epvOpBusiness = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("EPV operating business")
    );
    epvOpBusiness = epvOpBusiness ? epvOpBusiness["EPV operating business"] : 0;

    var cash = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("Cash"));
    cash = cash ? cash["Cash"] : 0;

    var debt = epvObj[qfsSymbol].find((obj) => obj.hasOwnProperty("Debt"));
    debt = debt ? debt["Debt"] : 0;

    var nrShares = epvObj[qfsSymbol].find((obj) =>
      obj.hasOwnProperty("Nr. Shares")
    );
    nrShares = nrShares ? nrShares["Nr. Shares"] : 0;

    return (
      (epvOpBusiness[caseIndex] + cash[caseIndex] - debt[caseIndex]) /
      nrShares[caseIndex]
    );
  }
};
