type NewModel = {
  isNew: true;
};

export type ValuationData = {
  revenue: [number, number, number];
  cogs: [number, number, number];
  sga: [number, number, number];
  rnd: [number, number, number];
  other_opex: [number, number, number];
  op_margins: [number, number, number];
  operatingAssets: [number, number, number];
  operatingLiabilities: [number, number, number];
  netOperatingAssets: [number, number, number];
  bookValue: [number, number, number];
};

type ValuationAssumptions = {
  taxRate: number;
  wacc: number;
  terminalGrowthRate: number;
};

// mergee the two types
export type ValuationModelData = {
  valuationData: ValuationData;
} & ValuationAssumptions;

export type ExistingModel = {
  isNew?: false;
  id: number;
  qfs_symbol: string;
  name: string;
  description: string;
  data: string;
  created_at: string;
};

export type SelectedModel = NewModel | ExistingModel;
