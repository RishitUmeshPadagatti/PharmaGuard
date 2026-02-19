import fs from "fs";
import VCF, { Variant as GmodVariant } from "@gmod/vcf";
import type { PGxVariant } from "../types/variant.types.js";

export async function parseVCF(fileBuffer: Buffer): Promise<PGxVariant[]> {
  const fileContent = fileBuffer.toString("utf-8");
  const normalizedContent = fileContent.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");

  const headerLines = lines.filter((line) => line.startsWith("#"));

  const parser = new VCF({
    header: headerLines.join("\n"),
  });

  const variants: PGxVariant[] = [];

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;

    const parsed: GmodVariant = parser.parseLine(line);

    const info = parsed.INFO;

    // INFO values are arrays unless Flag
    const gene = Array.isArray(info?.GENE) ? info.GENE[0] : info?.GENE;

    const star = Array.isArray(info?.STAR) ? info.STAR[0] : info?.STAR;

    const rsFromInfo = Array.isArray(info?.RS) ? info.RS[0] : info?.RS;

    const rsid =
      Array.isArray(parsed.ID) && parsed.ID.length > 0
        ? parsed.ID[0]
        : rsFromInfo;

    if (
      gene &&
      star &&
      rsid &&
      parsed.CHROM &&
      parsed.REF &&
      Array.isArray(parsed.ALT) &&
      parsed.ALT.length > 0
    ) {
      const alt = parsed.ALT[0];
      if (!alt) continue;
      variants.push({
        chromosome: parsed.CHROM,
        position: parsed.POS,
        rsid,
        ref: parsed.REF,
        alt,
        gene,
        star,
      });
    }
  }

  return variants;
}
