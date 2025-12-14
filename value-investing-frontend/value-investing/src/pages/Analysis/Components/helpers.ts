import { AppDispatch } from "src/app/store";
import {
  changeTaxRate,
  changeTerminalGrowthRate,
  changeWacc,
  initializeValuationData,
} from "src/features/analysisSlice";
import { ExistingModel, ValuationModelData } from "src/features/analysisTypes";

export function loadValuationModel(
  data: ValuationModelData,
  dispatch: AppDispatch
) {
  if (data?.valuationData) {
    dispatch(initializeValuationData(data?.valuationData));
  }

  if (data?.taxRate) {
    dispatch(changeTaxRate(data?.taxRate));
  }

  if (data?.wacc) {
    dispatch(changeWacc(data?.wacc));
  }

  if (data?.terminalGrowthRate) {
    dispatch(changeTerminalGrowthRate(data?.terminalGrowthRate));
  }
}

export function getScaleFactor(
  valueType: "absolute" | "perc" | "no-scaling",
  currentScaling: number
) {
  switch (valueType) {
    case "absolute":
      return currentScaling;
    case "perc":
      return 0.01; //we divide by scale factor (so divide by 0.01 is the same as multiply by 100)
    case "no-scaling":
      return 1;
    default:
      return 1;
  }
}
