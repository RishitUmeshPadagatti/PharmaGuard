import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { isValidDrug, DrugName } from "../types/drug.types.js";
import { parseVCF } from "../services/vcfParser.service.js";
import { generateDiplotypes } from "../services/diplotype.service.js";
import { mapToPhenotype } from "../services/phenotype.service.js";
import { evaluateRisk, drugGeneMap } from "../services/riskEngine.service.js";
import { generateClinicalExplanation } from "../services/gemini.service.js";

export const analyzePatient = async (req: Request, res: Response) => {
  if (!req.session.patient_id) {
    req.session.patient_id = uuidv4().slice(0, 8);
  }

  const patientId = req.session.patient_id;
  try {
    // File validation
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "VCF file is required",
      });
    }

    const drugInput = req.body.drug;

    if (!drugInput || typeof drugInput !== "string") {
      return res.status(400).json({
        success: false,
        message: "At least one drug name is required",
      });
    }

    const drugs = drugInput
      .split(",")
      .map((d: string) => d.trim().toUpperCase())
      .filter(Boolean);

    if (drugs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid drugs provided",
      });
    }

    // Validate each drug
    for (const drug of drugs) {
      if (!isValidDrug(drug)) {
        return res.status(400).json({
          success: false,
          message: `Invalid drug name: ${drug}`,
        });
      }
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
    const variants = await parseVCF(req.file.buffer);
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
    const drugAnalysis = await Promise.all(
      drugs.map(async (drug) => {
        const gene = drugGeneMap[drug as DrugName];
        const risk = evaluateRisk(drug as DrugName, genePhenotypeMap);

        const geneProfile = phenotypeResults.find((p) => p.gene === gene);
        let explanation: any = {};

        if (geneProfile) {
          explanation = await generateClinicalExplanation({
            drug,
            gene: gene || "Unknown",
            diplotype: geneProfile.diplotype,
            phenotype: geneProfile.phenotype,
            risk_label: risk.risk_label,
            severity: risk.severity,
            variants: geneProfile.detected_variants.map((v) => v.rsid),
          });
        }

        return {
          drug,
          risk_assessment: risk,
          clinical_recommendation: {}, // placeholder for now
          explanation,
        };
      }),
    );

    // console.log("Diplotypes:", diplotypes);
    // console.log("Parsed Variants:", variants);

    // return res.status(200).json({
    //   patient_id: uuidv4(),
    //   drug: drugName,
    //   timestamp: new Date().toISOString(),
    //   risk_assessment: risk,
    //   pharmacogenomic_profile: phenotypeResults,
    //   clinical_recommendation: {},
    //   llm_generated_explanation: {},

    //   quality_metrics: {
    //     vcf_parsing_success: true,
    //   },
    //   //   success: true,
    //   //   variant_count: variants.length,
    //   //   variants,
    // });

    return res.status(200).json({
      patient_id: patientId,
      timestamp: new Date().toISOString(),

      pharmacogenomic_profile: {
        genes: phenotypeResults,
      },

      drug_analysis: drugAnalysis.map(({ explanation, ...rest }) => rest),

      llm_generated_explanation: {
        summary: drugAnalysis
          .map((d) => d.explanation?.summary)
          .filter(Boolean)
          .join("\n\n"),
      },

      quality_metrics: {
        vcf_parsing_success: true,
      },
    });


    
    // return res.status(200).json(
    //   {
    //     "patient_id": "59a9a0a3",
    //     "timestamp": "2026-02-19T19:57:54.553Z",
    //     "pharmacogenomic_profile": {
    //       "genes": [
    //         {
    //           "gene": "CYP2D6",
    //           "diplotype": "*4/*4",
    //           "phenotype": "PM",
    //           "detected_variants": [
    //             {
    //               "rsid": "rs3892097"
    //             },
    //             {
    //               "rsid": "rs1065852"
    //             }
    //           ]
    //         },
    //         {
    //           "gene": "CYP2C19",
    //           "diplotype": "*2/*2",
    //           "phenotype": "PM",
    //           "detected_variants": [
    //             {
    //               "rsid": "rs4244285"
    //             },
    //             {
    //               "rsid": "rs4986893"
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     "drug_analysis": [
    //       {
    //         "drug": "CODEINE",
    //         "risk_assessment": {
    //           "risk_label": "Toxic",
    //           "severity": "high",
    //           "confidence_score": 0.90
    //         },
    //         "clinical_recommendation": {}
    //       },
    //       {
    //         "drug": "CLOPIDOGREL",
    //         "risk_assessment": {
    //           "risk_label": "Ineffective",
    //           "severity": "high",
    //           "confidence_score": 0.95
    //         },
    //         "clinical_recommendation": {}
    //       }
    //     ],
    //     "llm_generated_explanation": {
    //       "summary": "The patient's CYP2D6 genotype is *4/*4, classifying them as a Poor Metabolizer (PM). For a prodrug like codeine, which requires CYP2D6 to convert into its active analgesic form, morphine, this genotype results in severely impaired or absent metabolic activation. The detected variants, rs3892097 and rs1065852, are characteristic of the non-functional *4 allele, leading to a significant reduction in enzyme activity. Consequently, this patient is unlikely to achieve effective pain relief from codeine, and based on these findings, the overall clinical risk assessment for this drug is classified as Toxic.\n\nThis patient has a *CYP2C19* diplotype of *2/*2, resulting in a Poor Metabolizer (PM) phenotype. Clopidogrel is a prodrug requiring activation by CYP2C19 to its active metabolite. As a PM, this patient exhibits significantly reduced or absent CYP2C19 enzyme activity, thereby impairing the conversion of clopidogrel to its active form. The detected variants, rs4244285 and rs4986893, are specifically associated with the *CYP2C19* null allele *2*, which leads to a severe loss of enzyme function. Consequently, clopidogrel activation will be impaired, leading to an \"Ineffective\" antiplatelet response and an increased risk of thrombotic events."
    //     },
    //     "quality_metrics": {
    //       "vcf_parsing_success": true
    //     }
    //   }
    // )
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
