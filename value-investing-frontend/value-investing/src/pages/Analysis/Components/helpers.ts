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
