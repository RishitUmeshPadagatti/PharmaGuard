import type { PGxVariant } from "../types/variant.types.js";

export interface GeneDiplotype {
  gene: string;
  diplotype: string;
}

export function generateDiplotypes(variants: PGxVariant[]): GeneDiplotype[] {
  // 1️⃣ Group variants by gene
  const geneMap: Record<string, string[]> = {};

  for (const variant of variants) {
    if (!geneMap[variant.gene]) {
      geneMap[variant.gene] = [];
    }

    geneMap[variant.gene]?.push(variant.star);
  }

  const results: GeneDiplotype[] = [];

  // 2️⃣ Construct diplotype per gene
  for (const [gene, stars] of Object.entries(geneMap)) {
    if (stars.length < 2) {
      results.push({
        gene,
        diplotype: "*?/??",
      });
      continue;
    }

    // Take first two alleles
    const [a1, a2] = stars.slice(0, 2);

    // Sort to maintain canonical format (*1/*4 not *4/*1 randomly)
    const sorted = [a1, a2].sort();

    results.push({
      gene,
      diplotype: `${sorted[0]}/${sorted[1]}`,
    });
  }

  return results;
}
