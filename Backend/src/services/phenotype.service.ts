import { phenotypeMap } from "../map_data/phenotypeMap.js";

export type Phenotype = "PM" | "IM" | "NM" | "RM" | "URM" | "Unknown";

export interface GenePhenotype {
  gene: string;
  diplotype: string;
  phenotype: Phenotype;
}

export function mapToPhenotype(gene: string, diplotype: string): Phenotype {
  const geneMap = phenotypeMap[gene];

  if (!geneMap) return "Unknown";

  return geneMap[diplotype] ?? "Unknown";
}
