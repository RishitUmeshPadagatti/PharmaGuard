export enum DrugName {
  CODEINE = "CODEINE",
  WARFARIN = "WARFARIN",
  CLOPIDOGREL = "CLOPIDOGREL",
  SIMVASTATIN = "SIMVASTATIN",
  AZATHIOPRINE = "AZATHIOPRINE",
  FLUOROURACIL = "FLUOROURACIL",
}

export const isValidDrug = (drug: string): drug is DrugName => {
  return Object.values(DrugName).includes(drug as DrugName);
};
