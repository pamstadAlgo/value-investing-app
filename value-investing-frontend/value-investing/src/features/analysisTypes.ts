type NewModel = {
  isNew: true;
};

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
