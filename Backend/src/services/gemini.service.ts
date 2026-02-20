import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

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

  const apiKeys = [
    process.env.GEMINI_API_KEY1,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
  ];

  let lastError = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    if (!apiKey) continue;

    const keyName = `GEMINI_API_KEY${i + 1}`;
    try {
      console.log(`Attempting analysis with ${keyName}...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`Successfully generated content using ${keyName}.`);
      return {
        summary: text.trim(),
        biological_mechanism: "",
        variant_citations: input.variants,
        clinical_impact: "",
      };
    } catch (error) {
      console.error(`${keyName} got cancelled due to error:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error("All Gemini API keys failed or were not provided.");
}

