import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from rag.retrieve_test import get_retriever

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash-lite")


def generate_clinical_response(gene, drug, phenotype, retrieved_docs):
    """
    Uses CPIC guideline context to generate a structured clinical_recommendation.
    """
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    prompt = f"""
You are a clinical pharmacogenomics assistant.

Use ONLY the provided CPIC guideline context below.
Do NOT use external knowledge.
Do NOT hallucinate.
If information is not present in the context, return null for that field.

Gene: {gene}
Drug: {drug}
Patient Phenotype: {phenotype}

CPIC Guideline Context:
{context}

Based on the CPIC guidelines above, generate a structured clinical recommendation for this patient.

Return STRICT JSON ONLY. No markdown. No explanation outside JSON.

Output format:
{{
  "clinical_recommendation": {{
    "recommendation": "A concise clinical action statement directly from CPIC guidelines (e.g. avoid standard dose, use alternative, reduce dose)",
    "alternative_drugs": ["list of CPIC-recommended alternative drugs if applicable, or empty array"],
    "dosing_guidance": "Specific dosing instruction from CPIC if available, otherwise null",
    "monitoring": "Any clinical monitoring requirements from CPIC guidelines, or null",
    "cpic_classification": "CPIC recommendation classification term if mentioned (e.g. Strong, Moderate, Optional), or null"
  }}
}}
"""

    response = model.generate_content(prompt)

    try:
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()

        return json.loads(raw_text)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return {
            "clinical_recommendation": {
                "recommendation": "Error generating CPIC recommendation",
                "alternative_drugs": [],
                "dosing_guidance": None,
                "monitoring": None,
                "cpic_classification": None,
            }
        }


def process_patient_analysis(patient_data):
    """
    Processes patient pharmacogenomic JSON and enriches each drug record
    with a CPIC-based clinical_recommendation from the RAG system.
    Returns the full original data with clinical_recommendation injected per drug.
    """
    profile = patient_data.get("pharmacogenomic_profile", {}).get("genes", [])
    drug_analysis = patient_data.get("drug_analysis", [])

    # Gene phenotype lookup
    gene_map = {item["gene"]: item["phenotype"] for item in profile}

    # Drug → Gene mapping (must match ingest.py)
    drug_to_gene_map = {
        "CODEINE": "CYP2D6",
        "CLOPIDOGREL": "CYP2C19",
        "WARFARIN": "CYP2C9",
        "SIMVASTATIN": "SLCO1B1",
        "AZATHIOPRINE": "TPMT",
        "MERCAPTOPURINE": "TPMT",
        "THIOGUANINE": "TPMT",
        "FLUOROURACIL": "DPYD",
        "CAPECITABINE": "DPYD",
    }

    enriched_drug_analysis = []

    for drug_record in drug_analysis:
        drug_name = drug_record.get("drug", "").upper()
        gene_name = drug_to_gene_map.get(drug_name)

        if not gene_name:
            enriched_drug_analysis.append({
                **drug_record,
                "clinical_recommendation": {
                    "recommendation": "No CPIC guideline mapping found for this drug",
                    "alternative_drugs": [],
                    "dosing_guidance": None,
                    "monitoring": None,
                    "cpic_classification": None,
                },
            })
            continue

        phenotype = gene_map.get(gene_name)
        if not phenotype:
            enriched_drug_analysis.append({
                **drug_record,
                "clinical_recommendation": {
                    "recommendation": f"Phenotype for {gene_name} not found in patient profile",
                    "alternative_drugs": [],
                    "dosing_guidance": None,
                    "monitoring": None,
                    "cpic_classification": None,
                },
            })
            continue

        # Retrieve CPIC guideline docs
        retriever = get_retriever(gene_name, drug_name, k=8)
        query = f"CPIC therapeutic recommendation for {drug_name} and {gene_name} {phenotype} phenotype"
        docs = retriever.invoke(query)

        # Generate clinical recommendation from LLM + CPIC context
        analysis = generate_clinical_response(gene_name, drug_name, phenotype, docs)

        enriched_drug_analysis.append({
            **drug_record,
            "clinical_recommendation": analysis.get("clinical_recommendation", {}),
        })

    # Return the full enriched patient payload
    return {
        **patient_data,
        "drug_analysis": enriched_drug_analysis,
    }
