import type { Phenotype } from "../map_data/phenotypeMap.js";
import type { DrugName } from "../types/drug.types.js";

export type RiskLabel =
  | "Safe"
  | "Adjust Dosage"
  | "Toxic"
  | "Ineffective"
  | "Unknown";

export type Severity = "none" | "low" | "moderate" | "high" | "critical";

interface RiskResult {
  risk_label: RiskLabel;
  severity: Severity;
  confidence_score: number;
}

const drugGeneMap: Record<DrugName, string> = {
  CODEINE: "CYP2D6",
  WARFARIN: "CYP2C9",
  CLOPIDOGREL: "CYP2C19",
  SIMVASTATIN: "SLCO1B1",
  AZATHIOPRINE: "TPMT",
  FLUOROURACIL: "DPYD",
};

const riskRules: Record<string, Record<Phenotype, RiskResult>> = {
  CYP2D6: {
    PM: { risk_label: "Toxic", severity: "high", confidence_score: 0.95 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "moderate",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: {
      risk_label: "Adjust Dosage",
      severity: "moderate",
      confidence_score: 0.9,
    },
    URM: { risk_label: "Toxic", severity: "critical", confidence_score: 0.97 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },

  CYP2C19: {
    PM: { risk_label: "Ineffective", severity: "high", confidence_score: 0.95 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "moderate",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: { risk_label: "Safe", severity: "low", confidence_score: 0.9 },
    URM: { risk_label: "Safe", severity: "low", confidence_score: 0.9 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },

  CYP2C9: {
    PM: { risk_label: "Toxic", severity: "high", confidence_score: 0.95 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "moderate",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    URM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },

  SLCO1B1: {
    PM: { risk_label: "Toxic", severity: "high", confidence_score: 0.95 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "moderate",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    URM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },

  TPMT: {
    PM: { risk_label: "Toxic", severity: "critical", confidence_score: 0.97 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "high",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    URM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },

  DPYD: {
    PM: { risk_label: "Toxic", severity: "critical", confidence_score: 0.97 },
    IM: {
      risk_label: "Adjust Dosage",
      severity: "high",
      confidence_score: 0.9,
    },
    NM: { risk_label: "Safe", severity: "none", confidence_score: 0.98 },
    RM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    URM: { risk_label: "Safe", severity: "none", confidence_score: 0.9 },
    Unknown: { risk_label: "Unknown", severity: "low", confidence_score: 0.5 },
  },
};

export function evaluateRisk(
  drug: DrugName,
  genePhenotypes: Record<string, Phenotype>,
): RiskResult {
  const gene = drugGeneMap[drug];

  const phenotype = genePhenotypes[gene] ?? "Unknown";

  const geneRule = riskRules[gene];

  if (!geneRule) {
    return {
      risk_label: "Unknown",
      severity: "low",
      confidence_score: 0.5,
    };
  }

  return (
    geneRule[phenotype] ?? {
      risk_label: "Unknown",
      severity: "low",
      confidence_score: 0.5,
    }
  );
}
