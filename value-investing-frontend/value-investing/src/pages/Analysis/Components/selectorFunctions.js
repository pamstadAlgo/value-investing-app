export function computeOpIncomeTopDown(data, caseIndex) {
  var opIncome = data?.revenue[caseIndex] * data?.op_margins[caseIndex];

  return opIncome;
}

export function computeOpIncomeBottomUp(data, caseIndex) {
  var opIncome =
    data?.revenue[caseIndex] -
    data?.cogs[caseIndex] -
    data?.sga[caseIndex] -
    data?.rnd[caseIndex] -
    data?.other_opex[caseIndex];

  return opIncome;
}

export function computeOpMarginBottomUp(data, caseIndex) {
  var opIncome = computeOpIncomeBottomUp(data, caseIndex);
  return opIncome / data?.revenue[caseIndex];
}

export function computeNopatTopDown(data, taxRate, caseIndex) {
  var nopat =
    data?.revenue[caseIndex] * data?.op_margins[caseIndex] * (1 - taxRate);

  return nopat;
}

export function computeNopatBottomUp(data, taxRate, caseIndex) {
  var opIncome = computeOpIncomeBottomUp(data, caseIndex);
  return opIncome * (1 - taxRate);
}
