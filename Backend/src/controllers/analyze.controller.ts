import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { isValidDrug } from "../types/drug.types.js";
import { parseVCF } from "../services/vcfParser.service.js";
import { generateDiplotypes } from "../services/diplotype.service.js";
import { mapToPhenotype } from "../services/phenotype.service.js";
import { evaluateRisk } from "../services/riskEngine.service.js";
import { success } from "zod";

export const analyzePatient = async (req: Request, res: Response) => {
  try {
    // File validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "VCF file is required",
      });
    }

    //Drug input validation
    const drug = req.body.drug;

    if (!drug || typeof drug !== "string") {
      return res.status(400).json({
        success: false,
        message: "Drug name is required",
      });
    }

    const drugName = drug.trim().toUpperCase();

    if (!isValidDrug(drugName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid drug name",
      });
    }

    // For now just return upload success
    //     return res.status(200).json({
    //       success: true,
    //       message: "File uploaded successfully",
    //       data: {
    //         fileName: req.file.filename,
    //         originalName: req.file.originalname,
    //         drug: drugName,
    //         fileSize: req.file.size,
    //       },
    //     });
    //   } catch (error: any) {
    //     return res.status(500).json({
    //       success: false,
    //       message: error.message || "Internal Server Error",
    //     });
    //   }
    const variants = await parseVCF(req.file.path);
    //const primaryGene = variants[0]?.gene;

    const diplotypes = generateDiplotypes(variants);
    const phenotypeResults = diplotypes.map((d) => {
      const geneVariants = variants.filter((v) => v.gene === d.gene);

      return {
        gene: d.gene,
        diplotype: d.diplotype,
        phenotype: mapToPhenotype(d.gene, d.diplotype),
        detected_variants: geneVariants.map((v) => ({
          rsid: v.rsid,
          //   gene: v.gene,
          //   star: v.star,
          //   chromosome: v.chromosome,
          //   position: v.position,
          //   ref: v.ref,
          //   alt: v.alt,
        })),
      };
    });
    const genePhenotypeMap = Object.fromEntries(
      phenotypeResults.map((p) => [p.gene, p.phenotype]),
    );
    const risk = evaluateRisk(drugName, genePhenotypeMap);
    // console.log("Diplotypes:", diplotypes);
    // console.log("Parsed Variants:", variants);

    return res.status(200).json({
      patient_id: uuidv4(),
      drug: drugName,
      timestamp: new Date().toISOString(),
      risk_assessment: risk,
      pharmacogenomic_profile: phenotypeResults,
      clinical_recommendation: {},
      llm_generated_explanation: {},
      quality_metrics: {
        vcf_parsing_success: true,
      },
      //   success: true,
      //   variant_count: variants.length,
      //   variants,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
