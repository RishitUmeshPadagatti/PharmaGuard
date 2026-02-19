import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_clinical_response(gene, drug, phenotype, retrieved_docs):

    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    prompt = f"""
You are a clinical pharmacogenomics assistant.

Use ONLY the provided CPIC guideline context.
Do NOT use external knowledge.
Do NOT hallucinate.
If information is missing, say "Not specified in CPIC context."

Gene: {gene}
Drug: {drug}
Patient Phenotype: {phenotype}

CPIC Context:
{context}

Provide output in the following structured format:

1. Therapeutic Recommendation
2. Dose Adjustment
3. Strength of Recommendation
4. Biological Mechanism
5. Supporting Variant Evidence (quote exact lines from context)

Be concise and clinical.
"""

    response = model.generate_content(prompt)

    return response.text
