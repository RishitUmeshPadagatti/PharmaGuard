import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

interface GeminiInput {
  drug: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  risk_label: string;
  severity: string;
  variants: string[];
}

export async function generateClinicalExplanation(input: GeminiInput) {
  const prompt = `
You are a clinical pharmacogenomics expert.

Patient Pharmacogenomic Data:
Drug: ${input.drug}
Primary Gene: ${input.gene}
Diplotype: ${input.diplotype}
Phenotype: ${input.phenotype}
Risk Classification: ${input.risk_label}
Severity Level: ${input.severity}
Detected Variants (rsIDs): ${input.variants.join(", ")}

Instructions:
1. Write a SINGLE, professional paragraph explaining the clinical implications of this result.
2. Start by stating the patient's genotype and phenotype.
3. Explain how this affects the metabolism of the drug.
4. Mention the specific variants detected (rsIDs) and their effect on enzyme function.
5. Conclude with the clinical risk assessment (${input.risk_label}).
6. Do NOT use bullet points, headers, or markdown formatting.
7. Keep it concise (approx. 4-6 sentences).
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    summary: text.trim(),
    biological_mechanism: "",
    variant_citations: input.variants,
    clinical_impact: "",
  };
}
